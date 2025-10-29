use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, MintTo};
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct PurchaseCredits<'info> {
    #[account(mut)]
    pub student: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, ProgramConfig>,

    #[account(
        mut,
        address = config.treasury
    )]
    /// CHECK: Treasury account validated by address constraint
    pub treasury: AccountInfo<'info>,

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

    #[account(
        init_if_needed,
        payer = student,
        space = StudentProfile::LEN,
        seeds = [b"student_profile", student.key().as_ref()],
        bump,
    )]
    pub student_profile: Account<'info, StudentProfile>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<PurchaseCredits>, amount: u64) -> Result<()> {
    let config = &ctx.accounts.config;
    
    // Calculate total cost
    let total_cost = config.credit_price
        .checked_mul(amount)
        .ok_or(AcademicChainError::ArithmeticOverflow)?;

    // Transfer SOL from student to treasury
    let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.student.key(),
        &ctx.accounts.treasury.key(),
        total_cost,
    );

    anchor_lang::solana_program::program::invoke(
        &transfer_ix,
        &[
            ctx.accounts.student.to_account_info(),
            ctx.accounts.treasury.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Mint credit tokens to student
    let seeds: &[&[u8]] = &[b"config", &[config.bump]];
    let signer = &[&seeds[..]];

    let cpi_accounts = MintTo {
        mint: ctx.accounts.credit_mint.to_account_info(),
        to: ctx.accounts.student_credit_account.to_account_info(),
        authority: config.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

    token::mint_to(cpi_ctx, amount)?;

    // Update student profile
    let profile = &mut ctx.accounts.student_profile;
    if profile.student == Pubkey::default() {
        profile.student = ctx.accounts.student.key();
        profile.created_at = Clock::get()?.unix_timestamp;
        profile.bump = ctx.bumps.student_profile;
    }
    
    profile.total_credits_purchased = profile.total_credits_purchased
        .checked_add(amount)
        .ok_or(AcademicChainError::ArithmeticOverflow)?;

    msg!("✅ Purchased {} credits for {} lamports", amount, total_cost);

    Ok(())
}
