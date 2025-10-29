use anchor_lang::prelude::*;

#[constant]
pub const PROGRAM_CONFIG_SEED: &[u8] = b"config";

#[constant]
pub const COURSE_SEED: &[u8] = b"course";

#[constant]
pub const ENROLLMENT_SEED: &[u8] = b"enrollment";

#[constant]
pub const STUDENT_PROFILE_SEED: &[u8] = b"student_profile";

#[constant]
pub const CERTIFICATE_MINT_SEED: &[u8] = b"certificate_mint";

#[constant]
pub const GRADUATION_MINT_SEED: &[u8] = b"graduation_mint";

// Token metadata constants
pub const NFT_NAME_PREFIX: &str = "AcademicChain Certificate - ";
pub const NFT_SYMBOL: &str = "ACADNFT";
pub const GRADUATION_NFT_NAME: &str = "AcademicChain Graduation";
pub const GRADUATION_NFT_SYMBOL: &str = "GRADNFT";

// Business logic constants
pub const MIN_GRADE: u8 = 0;
pub const MAX_GRADE: u8 = 100;
pub const PASSING_GRADE: u8 = 50;
