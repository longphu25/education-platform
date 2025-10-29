'use client'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useCallback, useMemo } from 'react'

export interface PrivySolanaWallet {
  address: string
  publicKey: string
  walletClientType: 'privy'
  chainType: 'solana'
  connector_type: 'embedded'
}

export function usePrivySolana() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()
  
  // Get the primary embedded Solana wallet
  const embeddedWallet = useMemo(() => {
    return wallets.find(wallet => 
      wallet.connectorType === 'embedded'
    )
  }, [wallets])

  // Check if user has any Solana wallets
  const hasSolanaWallet = useMemo(() => {
    return wallets.length > 0
  }, [wallets])

  // Get user display name
  const getUserDisplayName = useCallback(() => {
    if (!user) return null
    
    // Simple display name logic - this may need adjustment based on actual Privy user structure
    if (user.email?.address) return user.email.address
    if (user.phone?.number) return user.phone.number
    
    return 'Anonymous User'
  }, [user])

  // Compatibility layer for existing Solana components
  const account = useMemo(() => {
    if (!embeddedWallet) return null
    
    return {
      address: embeddedWallet.address,
      publicKey: embeddedWallet.address, // Solana address is the public key
      label: 'Privy Embedded Wallet',
    }
  }, [embeddedWallet])

  return {
    // Privy authentication state
    ready,
    authenticated,
    user,
    
    // Authentication actions
    login,
    logout,
    
    // Solana wallet state
    wallets,
    embeddedWallet,
    hasSolanaWallet,
    account, // For compatibility with existing components
    
    // Utility functions
    getUserDisplayName,
  }
}