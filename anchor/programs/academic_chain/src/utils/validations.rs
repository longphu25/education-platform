use anchor_lang::prelude::*;
use crate::errors::*;
use crate::constants::*;

/// Validate course ID format
pub fn validate_course_id(course_id: &str) -> Result<()> {
    require!(
        !course_id.is_empty() && course_id.len() <= 32,
        AcademicChainError::InvalidCourseId
    );
    Ok(())
}

/// Validate grade is within acceptable range
pub fn validate_grade(grade: u8) -> Result<()> {
    require!(
        grade >= MIN_GRADE && grade <= MAX_GRADE,
        AcademicChainError::InvalidGrade
    );
    Ok(())
}

/// Check if grade is passing
pub fn is_passing_grade(grade: u8) -> bool {
    grade >= PASSING_GRADE
}
