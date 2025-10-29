use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Burn, Mint};
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(course_id: String)]
pub struct RegisterCourse<'info> {
    #[account(mut)]
    pub student: Signer<'info>,

    #[account(
        seeds = [b"course", course_id.as_bytes()],
        bump = course.bump,
    )]
    pub course: Account<'info, Course>,

    #[account(
        init,
        payer = student,
        space = CourseEnrollment::LEN,
        seeds = [b"enrollment", student.key().as_ref(), course_id.as_bytes()],
        bump,
    )]
    pub enrollment: Account<'info, CourseEnrollment>,

    #[account(
        mut,
        seeds = [b"student_profile", student.key().as_ref()],
        bump = student_profile.bump,
    )]
    pub student_profile: Account<'info, StudentProfile>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, ProgramConfig>,

    #[account(
        mut,
        address = config.credit_mint
    )]
    pub credit_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = credit_mint,
        associated_token::authority = student,
    )]
    pub student_credit_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RegisterCourse>, course_id: String) -> Result<()> {
    let course = &ctx.accounts.course;
    
    // Validate course is active
    require!(course.is_active, AcademicChainError::CourseNotActive);

    // Check student has enough credits
    require!(
        ctx.accounts.student_credit_account.amount >= course.required_credits,
        AcademicChainError::InsufficientCredits
    );

    // Burn credits from student account
    let cpi_accounts = Burn {
        mint: ctx.accounts.credit_mint.to_account_info(),
        from: ctx.accounts.student_credit_account.to_account_info(),
        authority: ctx.accounts.student.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    token::burn(cpi_ctx, course.required_credits)?;

    // Initialize enrollment
    let enrollment = &mut ctx.accounts.enrollment;
    enrollment.student = ctx.accounts.student.key();
    enrollment.course_id = course_id;
    enrollment.credits_paid = course.required_credits;
    enrollment.enrollment_date = Clock::get()?.unix_timestamp;
    enrollment.completion_date = None;
    enrollment.is_completed = false;
    enrollment.grade = 0;
    enrollment.certificate_mint = None;
    enrollment.bump = ctx.bumps.enrollment;

    // Update student profile
    let profile = &mut ctx.accounts.student_profile;
    profile.total_credits_spent = profile.total_credits_spent
        .checked_add(course.required_credits)
        .ok_or(AcademicChainError::ArithmeticOverflow)?;

    msg!("✅ Registered for course: {}", course.course_name);
    msg!("Credits spent: {}", course.required_credits);

    Ok(())
}
