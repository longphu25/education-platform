/**
 * Wallet Management Utilities
 * Helper functions for detecting wallet types, switching wallets, and handling transactions
 */

import { WalletType, LoginMethod } from '@/components/solana/use-solana'

export interface WalletInfo {
  address: string
  type: WalletType
  label: string
  loginMethod: LoginMethod
}

type LinkedAccount = {
  type: string
  address?: string
  number?: string
  [key: string]: unknown
}

/**
 * Detect wallet type from user's linked accounts
 */
export function detectWalletType(linkedAccounts: LinkedAccount[]): WalletType {
  if (!linkedAccounts || linkedAccounts.length === 0) return null
  
  const hasWallet = linkedAccounts.some(account => account.type === 'wallet')
  return hasWallet ? 'external' : 'embedded'
}

/**
 * Detect login method from user's linked accounts
 */
export function detectLoginMethod(linkedAccounts: LinkedAccount[]): LoginMethod {
  if (!linkedAccounts || linkedAccounts.length === 0) return null
  
  const hasWallet = linkedAccounts.some(account => account.type === 'wallet')
  if (hasWallet) return 'wallet'
  
  const hasEmail = linkedAccounts.some(account => account.type === 'email')
  if (hasEmail) return 'email'
  
  const hasPhone = linkedAccounts.some(account => account.type === 'phone')
  if (hasPhone) return 'phone'
  
  const hasSocial = linkedAccounts.some(account => 
    account.type.includes('oauth') || 
    ['google_oauth', 'twitter_oauth', 'discord_oauth', 'github_oauth', 'linkedin_oauth'].includes(account.type)
  )
  if (hasSocial) return 'social'
  
  return null
}

/**
 * Get user display name from linked accounts
 */
export function getUserDisplayName(linkedAccounts: LinkedAccount[]): string {
  if (!linkedAccounts || linkedAccounts.length === 0) return 'Anonymous User'
  
  const emailAccount = linkedAccounts.find(account => account.type === 'email')
  if (emailAccount?.address) return emailAccount.address
  
  const phoneAccount = linkedAccounts.find(account => account.type === 'phone')
  if (phoneAccount?.number) return phoneAccount.number
  
  const socialAccount = linkedAccounts.find(account => 
    ['google_oauth', 'twitter_oauth', 'discord_oauth', 'github_oauth', 'linkedin_oauth'].includes(account.type)
  )
  if (socialAccount) return `${socialAccount.type.replace('_oauth', '')} user`
  
  return 'Privy User'
}

/**
 * Check if wallet needs to be created (for non-wallet login methods)
 */
export function shouldCreateEmbeddedWallet(loginMethod: LoginMethod): boolean {
  return loginMethod !== null && loginMethod !== 'wallet'
}

/**
 * Get wallet status message
 */
export function getWalletStatusMessage(
  walletType: WalletType, 
  loginMethod: LoginMethod, 
  isCreating: boolean
): string {
  if (isCreating) {
    return 'Creating your secure embedded Solana wallet...'
  }
  
  if (!walletType || !loginMethod) {
    return 'Wallet setup in progress...'
  }
  
  if (walletType === 'embedded') {
    return `Embedded wallet active (${loginMethod} login)`
  }
  
  if (walletType === 'external') {
    return `External wallet connected (${loginMethod} login)`
  }
  
  return 'Wallet status unknown'
}

/**
 * Format wallet address for display
 */
export function formatWalletAddress(address: string, start = 8, end = 8): string {
  if (!address || address.length <= start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

/**
 * Get wallet type icon/emoji
 */
export function getWalletIcon(walletType: WalletType): string {
  switch (walletType) {
    case 'embedded':
      return '🔒'
    case 'external':
      return '🔗'
    default:
      return '👛'
  }
}

/**
 * Get login method icon/emoji
 */
export function getLoginMethodIcon(loginMethod: LoginMethod): string {
  switch (loginMethod) {
    case 'email':
      return '📧'
    case 'phone':
      return '📱'
    case 'social':
      return '🔗'
    case 'wallet':
      return '👛'
    default:
      return '🔐'
  }
}

/**
 * Check if transaction is ready (wallet is properly set up)
 */
export function isTransactionReady(
  authenticated: boolean,
  account: unknown,
  isCreatingWallet: boolean
): boolean {
  return authenticated && !!account && !isCreatingWallet
}

/**
 * Get transaction capability message
 */
export function getTransactionCapabilityMessage(
  walletType: WalletType,
  isReady: boolean
): string {
  if (!isReady) {
    return 'Wallet setup required for transactions'
  }
  
  if (walletType === 'embedded') {
    return 'Ready to sign transactions with embedded wallet'
  }
  
  if (walletType === 'external') {
    return 'Ready to sign transactions with external wallet'
  }
  
  return 'Transaction capability unknown'
}

/**
 * Create mock transaction for testing
 */
export function createMockTransaction(type: 'transfer' | 'program_call' = 'transfer') {
  return {
    type,
    timestamp: Date.now(),
    instructions: [
      {
        programId: 'mock_program_id',
        data: new Uint8Array([1, 2, 3, 4]),
        keys: []
      }
    ]
  }
}

/**
 * Simulate transaction signing based on wallet type
 */
export async function simulateTransactionSigning(
  transaction: unknown,
  walletType: WalletType
): Promise<{ signature: string; status: 'success' | 'error'; message: string }> {
  console.log(`Simulating transaction signing with ${walletType} wallet:`, transaction)
  
  // Simulate signing delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  if (walletType === 'embedded') {
    return {
      signature: `embedded_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      status: 'success',
      message: 'Transaction signed with embedded wallet'
    }
  }
  
  if (walletType === 'external') {
    return {
      signature: `external_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      status: 'success', 
      message: 'Transaction signed with external wallet'
    }
  }
  
  return {
    signature: '',
    status: 'error',
    message: 'Unknown wallet type'
  }
}