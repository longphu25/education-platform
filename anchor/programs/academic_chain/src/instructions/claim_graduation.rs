use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct ClaimGraduation<'info> {
    #[account(mut)]
    pub student: Signer<'info>,

    #[account(
        mut,
        seeds = [b"student_profile", student.key().as_ref()],
        bump = student_profile.bump,
        constraint = student_profile.graduation_nft.is_none() @ AcademicChainError::CertificateAlreadyMinted,
    )]
    pub student_profile: Account<'info, StudentProfile>,

    /// CHECK: Graduation NFT mint to be created
    #[account(
        mut,
        seeds = [b"graduation_mint", student.key().as_ref()],
        bump,
    )]
    pub graduation_mint: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<ClaimGraduation>,
    required_courses: Vec<String>,
) -> Result<()> {
    let profile = &mut ctx.accounts.student_profile;
    
    // Validate minimum courses completed
    require!(
        profile.courses_completed >= required_courses.len() as u16,
        AcademicChainError::RequirementsNotMet
    );

    // Store graduation NFT mint
    profile.graduation_nft = Some(ctx.accounts.graduation_mint.key());

    msg!("✅ Graduation NFT claimed");
    msg!("Student: {}", ctx.accounts.student.key());
    msg!("Total courses completed: {}", profile.courses_completed);
    msg!("Graduation Mint: {}", ctx.accounts.graduation_mint.key());

    Ok(())
}
