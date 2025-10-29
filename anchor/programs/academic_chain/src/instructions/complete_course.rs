use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(course_id: String)]
pub struct CompleteCourse<'info> {
    #[account(mut)]
    pub instructor: Signer<'info>,

    #[account(
        seeds = [b"course", course_id.as_bytes()],
        bump = course.bump,
        constraint = course.instructor == instructor.key() @ AcademicChainError::UnauthorizedInstructor
    )]
    pub course: Account<'info, Course>,

    /// CHECK: Student public key
    pub student: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"enrollment", student.key().as_ref(), course_id.as_bytes()],
        bump = enrollment.bump,
        constraint = enrollment.student == student.key(),
    )]
    pub enrollment: Account<'info, CourseEnrollment>,

    #[account(
        mut,
        seeds = [b"student_profile", student.key().as_ref()],
        bump = student_profile.bump,
    )]
    pub student_profile: Account<'info, StudentProfile>,
}

pub fn handler(ctx: Context<CompleteCourse>, _course_id: String, grade: u8) -> Result<()> {
    // Validate grade
    require!(
        grade >= MIN_GRADE && grade <= MAX_GRADE,
        AcademicChainError::InvalidGrade
    );

    let enrollment = &mut ctx.accounts.enrollment;
    
    // Mark course as completed
    enrollment.is_completed = true;
    enrollment.grade = grade;
    enrollment.completion_date = Some(Clock::get()?.unix_timestamp);

    // Update student profile
    let profile = &mut ctx.accounts.student_profile;
    profile.courses_completed = profile.courses_completed
        .checked_add(1)
        .ok_or(AcademicChainError::ArithmeticOverflow)?;

    msg!("✅ Course completed");
    msg!("Student: {}", enrollment.student);
    msg!("Grade: {}", grade);

    Ok(())
}
