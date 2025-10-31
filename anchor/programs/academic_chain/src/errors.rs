use anchor_lang::prelude::*;

#[error_code]
pub enum AcademicChainError {
    #[msg("Insufficient credits to register for this course")]
    InsufficientCredits,
    
    #[msg("Course is not active")]
    CourseNotActive,
    
    #[msg("Student already enrolled in this course")]
    AlreadyEnrolled,
    
    #[msg("Course not completed yet")]
    CourseNotCompleted,
    
    #[msg("Invalid grade value (must be 0-100)")]
    InvalidGrade,
    
    #[msg("Unauthorized: Only instructor can perform this action")]
    UnauthorizedInstructor,
    
    #[msg("Certificate already minted for this course")]
    CertificateAlreadyMinted,
    
    #[msg("Not all required courses completed")]
    RequirementsNotMet,
    
    #[msg("Invalid course ID format")]
    InvalidCourseId,
    
    #[msg("Invalid course name")]
    InvalidCourseName,
    
    #[msg("Invalid credits amount")]
    InvalidCredits,
    
    #[msg("Unauthorized: Only program authority can perform this action")]
    Unauthorized,
    
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
}
