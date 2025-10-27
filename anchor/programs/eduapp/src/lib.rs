#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe");

#[program]
pub mod eduapp {
    use super::*;

    pub fn close(_ctx: Context<CloseEduapp>) -> Result<()> {
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.eduapp.count = ctx.accounts.eduapp.count.checked_sub(1).unwrap();
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.eduapp.count = ctx.accounts.eduapp.count.checked_add(1).unwrap();
        Ok(())
    }

    pub fn initialize(_ctx: Context<InitializeEduapp>) -> Result<()> {
        Ok(())
    }

    pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
        ctx.accounts.eduapp.count = value.clone();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeEduapp<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  init,
  space = 8 + Eduapp::INIT_SPACE,
  payer = payer
    )]
    pub eduapp: Account<'info, Eduapp>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseEduapp<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  mut,
  close = payer, // close account and return lamports to payer
    )]
    pub eduapp: Account<'info, Eduapp>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub eduapp: Account<'info, Eduapp>,
}

#[account]
#[derive(InitSpace)]
pub struct Eduapp {
    count: u8,
}
