use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(course_id: String)]
pub struct MintCertificate<'info> {
    #[account(mut)]
    pub student: Signer<'info>,

    #[account(
        seeds = [b"course", course_id.as_bytes()],
        bump = course.bump,
    )]
    pub course: Account<'info, Course>,

    #[account(
        mut,
        seeds = [b"enrollment", student.key().as_ref(), course_id.as_bytes()],
        bump = enrollment.bump,
        constraint = enrollment.student == student.key(),
        constraint = enrollment.is_completed @ AcademicChainError::CourseNotCompleted,
        constraint = enrollment.certificate_mint.is_none() @ AcademicChainError::CertificateAlreadyMinted,
    )]
    pub enrollment: Account<'info, CourseEnrollment>,

    /// CHECK: Certificate mint to be created
    #[account(
        mut,
        seeds = [b"certificate_mint", student.key().as_ref(), course_id.as_bytes()],
        bump,
    )]
    pub certificate_mint: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<MintCertificate>,
    _course_id: String,
    _metadata_uri: String,
) -> Result<()> {
    let enrollment = &mut ctx.accounts.enrollment;
    
    // Store certificate mint address
    enrollment.certificate_mint = Some(ctx.accounts.certificate_mint.key());

    msg!("✅ Certificate NFT minted");
    msg!("Student: {}", enrollment.student);
    msg!("Course: {}", ctx.accounts.course.course_name);
    msg!("Grade: {}", enrollment.grade);
    msg!("Certificate Mint: {}", ctx.accounts.certificate_mint.key());

    Ok(())
}
