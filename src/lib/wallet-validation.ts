/**
 * Wallet Validation Utilities
 * Helper functions for validating wallet connections and transactions
 */

import type { Address } from 'gill'
import type { UiWalletAccount } from '@wallet-ui/react'

export interface WalletValidationResult {
  isValid: boolean
  error?: string
  details?: {
    hasAccount: boolean
    hasAddress: boolean
    hasSigner: boolean
  }
}

/**
 * Validate that a wallet account is ready for transactions
 */
export function validateWalletAccount(
  account?: UiWalletAccount | null
): WalletValidationResult {
  if (!account) {
    return {
      isValid: false,
      error: 'No wallet account found',
      details: {
        hasAccount: false,
        hasAddress: false,
        hasSigner: false,
      },
    }
  }

  if (!account.address) {
    return {
      isValid: false,
      error: 'Wallet account has no address',
      details: {
        hasAccount: true,
        hasAddress: false,
        hasSigner: false,
      },
    }
  }

  return {
    isValid: true,
    details: {
      hasAccount: true,
      hasAddress: true,
      hasSigner: true,
    },
  }
}

/**
 * Validate transaction signer
 */
export function validateTransactionSigner(signer?: {
  address?: Address
  signTransactions?: unknown
}): WalletValidationResult {
  if (!signer) {
    return {
      isValid: false,
      error: 'Transaction signer not available',
    }
  }

  if (!signer.address) {
    return {
      isValid: false,
      error: 'Signer has no address',
    }
  }

  if (!signer.signTransactions) {
    return {
      isValid: false,
      error: 'Signer cannot sign transactions',
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Validate transaction amount
 */
export function validateAmount(
  amount: number | string,
  options?: {
    min?: number
    max?: number
    requireInteger?: boolean
  }
): WalletValidationResult {
  const { min = 0, max, requireInteger = true } = options || {}

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (Number.isNaN(numAmount)) {
    return {
      isValid: false,
      error: 'Amount must be a valid number',
    }
  }

  if (requireInteger && !Number.isInteger(numAmount)) {
    return {
      isValid: false,
      error: 'Amount must be a whole number',
    }
  }

  if (numAmount <= min) {
    return {
      isValid: false,
      error: `Amount must be greater than ${min}`,
    }
  }

  if (max !== undefined && numAmount > max) {
    return {
      isValid: false,
      error: `Amount must be less than or equal to ${max}`,
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Validate Solana address format
 */
export function validateSolanaAddress(address?: string | Address): WalletValidationResult {
  if (!address) {
    return {
      isValid: false,
      error: 'Address is required',
    }
  }

  const addressStr = String(address)

  // Basic validation: should be base58 string between 32-44 characters
  if (addressStr.length < 32 || addressStr.length > 44) {
    return {
      isValid: false,
      error: 'Invalid address length',
    }
  }

  // Check for valid base58 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/
  if (!base58Regex.test(addressStr)) {
    return {
      isValid: false,
      error: 'Address contains invalid characters',
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Check if wallet has sufficient balance
 */
export function checkSufficientBalance(
  balance: bigint | number,
  required: bigint | number,
  options?: {
    buffer?: number // Extra percentage buffer (e.g., 10 for 10%)
  }
): WalletValidationResult {
  const { buffer = 5 } = options || {}

  const balanceNum = typeof balance === 'bigint' ? Number(balance) : balance
  const requiredNum = typeof required === 'bigint' ? Number(required) : required

  // Add buffer for transaction fees
  const requiredWithBuffer = requiredNum * (1 + buffer / 100)

  if (balanceNum < requiredWithBuffer) {
    return {
      isValid: false,
      error: `Insufficient balance. Required: ${requiredWithBuffer.toFixed(9)} SOL, Available: ${balanceNum.toFixed(9)} SOL`,
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Get user-friendly error message from transaction error
 */
export function getTransactionErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error occurred'

  if (typeof error === 'string') return error

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Wallet connection errors
    if (message.includes('wallet') || message.includes('not connected')) {
      return 'Wallet not connected. Please connect your wallet and try again.'
    }

    // Balance errors
    if (message.includes('insufficient') || message.includes('balance')) {
      return 'Insufficient SOL balance. Please add more SOL to your wallet.'
    }

    // Transaction errors
    if (message.includes('blockhash') || message.includes('expired')) {
      return 'Transaction expired. Please try again.'
    }

    // User rejection
    if (message.includes('user rejected') || message.includes('rejected')) {
      return 'Transaction was rejected. Please approve the transaction in your wallet.'
    }

    // Network errors
    if (message.includes('network') || message.includes('timeout')) {
      return 'Network error. Please check your connection and try again.'
    }

    // Simulation errors
    if (message.includes('simulation failed')) {
      return 'Transaction simulation failed. Please check your inputs and try again.'
    }

    // Program errors
    if (message.includes('custom program error')) {
      return 'Smart contract error. Please contact support if this persists.'
    }

    // Return the original message if it's user-friendly
    if (error.message.length < 100 && !message.includes('0x')) {
      return error.message
    }

    return 'Transaction failed. Please try again or contact support.'
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Format wallet address for display
 */
export function formatWalletAddress(
  address: string | Address,
  options?: {
    startChars?: number
    endChars?: number
  }
): string {
  const { startChars = 4, endChars = 4 } = options || {}
  const addressStr = String(address)

  if (addressStr.length <= startChars + endChars) {
    return addressStr
  }

  return `${addressStr.slice(0, startChars)}...${addressStr.slice(-endChars)}`
}

/**
 * Log wallet debugging information
 */
export function debugWalletState(
  connected: boolean,
  account?: UiWalletAccount | null,
  signer?: { address?: Address }
): void {
  console.group('🔍 Wallet Debug Info')
  console.log('Connected:', connected)
  console.log('Account:', account ? formatWalletAddress(account.address) : 'None')
  console.log('Signer:', signer?.address ? formatWalletAddress(signer.address) : 'None')
  console.log('Account validation:', validateWalletAccount(account))
  console.log('Signer validation:', validateTransactionSigner(signer))
  console.groupEnd()
}
