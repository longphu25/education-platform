use anchor_lang::prelude::*;

/// Program configuration
#[account]
pub struct ProgramConfig {
    pub authority: Pubkey,
    pub credit_mint: Pubkey,
    pub treasury: Pubkey,
    pub credit_price: u64,  // Price in lamports per credit
    pub bump: u8,
}

impl ProgramConfig {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 1;
}

/// Course information
#[account]
pub struct Course {
    pub course_id: String,
    pub course_name: String,
    pub instructor: Pubkey,
    pub required_credits: u64,
    pub is_active: bool,
    pub created_at: i64,
    pub bump: u8,
}

impl Course {
    pub const MAX_ID_LEN: usize = 32;
    pub const MAX_NAME_LEN: usize = 100;
    pub const LEN: usize = 8 + 4 + Self::MAX_ID_LEN + 4 + Self::MAX_NAME_LEN + 32 + 8 + 1 + 8 + 1;
}

/// Student course enrollment
#[account]
pub struct CourseEnrollment {
    pub student: Pubkey,
    pub course_id: String,
    pub credits_paid: u64,
    pub enrollment_date: i64,
    pub completion_date: Option<i64>,
    pub is_completed: bool,
    pub grade: u8,
    pub certificate_mint: Option<Pubkey>,
    pub bump: u8,
}

impl CourseEnrollment {
    pub const MAX_COURSE_ID_LEN: usize = 32;
    pub const LEN: usize = 8 + 32 + 4 + Self::MAX_COURSE_ID_LEN + 8 + 8 + 9 + 1 + 1 + 33 + 1;
}

/// Student profile
#[account]
pub struct StudentProfile {
    pub student: Pubkey,
    pub total_credits_purchased: u64,
    pub total_credits_spent: u64,
    pub courses_completed: u16,
    pub graduation_nft: Option<Pubkey>,
    pub created_at: i64,
    pub bump: u8,
}

impl StudentProfile {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 2 + 33 + 8 + 1;
}
