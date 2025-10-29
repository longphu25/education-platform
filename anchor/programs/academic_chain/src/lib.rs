use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod constants;
pub mod utils;

use instructions::*;

declare_id!("9HuNte7WjS8GVHBKpE42y1QXq4C7e6uNvtjmDRM1G99F");

#[program]
pub mod academic_chain {
    use super::*;

    /// Initialize the program
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    /// Purchase credit tokens
    pub fn purchase_credits(
        ctx: Context<PurchaseCredits>,
        amount: u64,
    ) -> Result<()> {
        instructions::purchase_credits::handler(ctx, amount)
    }

    /// Register for a course
    pub fn register_course(
        ctx: Context<RegisterCourse>,
        course_id: String,
    ) -> Result<()> {
        instructions::register_course::handler(ctx, course_id)
    }

    /// Mark course as completed
    pub fn complete_course(
        ctx: Context<CompleteCourse>,
        course_id: String,
        grade: u8,
    ) -> Result<()> {
        instructions::complete_course::handler(ctx, course_id, grade)
    }

    /// Mint NFT certificate
    pub fn mint_certificate(
        ctx: Context<MintCertificate>,
        course_id: String,
        metadata_uri: String,
    ) -> Result<()> {
        instructions::mint_certificate::handler(ctx, course_id, metadata_uri)
    }

    /// Claim graduation NFT
    pub fn claim_graduation(
        ctx: Context<ClaimGraduation>,
        required_courses: Vec<String>,
    ) -> Result<()> {
        instructions::claim_graduation::handler(ctx, required_courses)
    }
}
