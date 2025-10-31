use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(course_id: String, course_name: String)]
pub struct CreateCourse<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Course::LEN,
        seeds = [b"course", course_id.as_bytes()],
        bump,
    )]
    pub course: Account<'info, Course>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateCourse>,
    course_id: String,
    course_name: String,
    instructor: Pubkey,
    required_credits: u64,
) -> Result<()> {
    require!(
        course_id.len() <= Course::MAX_ID_LEN,
        AcademicChainError::InvalidCourseId
    );
    
    require!(
        course_name.len() <= Course::MAX_NAME_LEN,
        AcademicChainError::InvalidCourseName
    );

    require!(
        required_credits > 0,
        AcademicChainError::InvalidCredits
    );

    let course = &mut ctx.accounts.course;
    course.course_id = course_id;
    course.course_name = course_name;
    course.instructor = instructor;
    course.required_credits = required_credits;
    course.is_active = true;
    course.created_at = Clock::get()?.unix_timestamp;
    course.bump = ctx.bumps.course;

    msg!("Course created: {}", course.course_id);
    Ok(())
}
