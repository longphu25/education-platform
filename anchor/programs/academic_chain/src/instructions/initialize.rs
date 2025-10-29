use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = ProgramConfig::LEN,
        seeds = [b"config"],
        bump,
    )]
    pub config: Account<'info, ProgramConfig>,

    /// CHECK: Treasury account for receiving payments
    pub treasury: AccountInfo<'info>,

    /// CHECK: Credit token mint
    pub credit_mint: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    
    config.authority = ctx.accounts.authority.key();
    config.treasury = ctx.accounts.treasury.key();
    config.credit_mint = ctx.accounts.credit_mint.key();
    config.credit_price = 1_000_000; // 0.001 SOL per credit (default)
    config.bump = ctx.bumps.config;

    msg!("✅ Program initialized");
    msg!("Authority: {}", config.authority);
    msg!("Treasury: {}", config.treasury);
    msg!("Credit Mint: {}", config.credit_mint);

    Ok(())
}
