use anchor_lang::prelude::*;

/// Helper functions for token operations
/// Additional token utility functions can be added here as needed

/// Calculate total cost for credits
pub fn calculate_credit_cost(amount: u64, price_per_credit: u64) -> Result<u64> {
    amount
        .checked_mul(price_per_credit)
        .ok_or_else(|| error!(anchor_lang::error::ErrorCode::AccountDidNotSerialize))
}
