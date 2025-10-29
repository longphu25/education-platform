'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useSolana } from '@/components/solana/use-solana'
import { useCallback, useState } from 'react'

export interface PrivyUser {
  id: string
  email?: string
  phone?: string
  createdAt: Date
  linkedAccounts: Array<{
    type: string
    address?: string
    email?: string
    phone?: string
  }>
}

export function usePrivyAuth() {
  const { 
    ready, 
    authenticated, 
    user, 
    login, 
    logout, 
    linkEmail, 
    unlinkEmail,
  } = usePrivy()
  console.log(user);
  
  const solana = useSolana()
  const [isLoading, setIsLoading] = useState(false)

  const loginWithPrivy = useCallback(async () => {
    setIsLoading(true)
    try {
      await login()
    } catch (error) {
      console.error('Privy login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [login])

  const logoutFromPrivy = useCallback(async () => {
    setIsLoading(true)
    try {
      await logout()
    } catch (error) {
      console.error('Privy logout failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [logout])

  // Get user's primary identifier
  const getUserDisplayName = useCallback(() => {
    if (!user) return null
    
    // Try to get email first
    const emailAccount = user.linkedAccounts?.find(account => account.type === 'email')
        if (emailAccount?.address) return emailAccount.address
    
    // Try phone next
    const phoneAccount = user.linkedAccounts?.find(account => account.type === 'phone')
    if (phoneAccount?.address) return phoneAccount.address
    
    // Try social accounts
    const socialAccount = user.linkedAccounts?.find(account => 
      ['google_oauth', 'twitter_oauth', 'discord_oauth', 'github_oauth', 'linkedin_oauth'].includes(account.type)
    )
    if (socialAccount) return `${socialAccount.type.replace('_oauth', '')} user`
    
    return 'Anonymous User'
  }, [user])

  const getUserEmail = useCallback(() => {
    if (!user) return null
    const emailAccount = user.linkedAccounts?.find(account => account.type === 'email')
    return emailAccount?.email || null
  }, [user])

  const getUserPhone = useCallback(() => {
    if (!user) return null
    const phoneAccount = user.linkedAccounts?.find(account => account.type === 'phone')
    return phoneAccount?.phone || null
  }, [user])

  return {
    // Privy state
    ready,
    authenticated,
    user: user as PrivyUser | null,
    isLoading,
    
    // Privy actions (authentication only)
    login: loginWithPrivy,
    logout: logoutFromPrivy,
    linkEmail,
    unlinkEmail,
    
    // Helper functions
    getUserDisplayName,
    getUserEmail,
    getUserPhone,
    
    // Solana integration (separate from Privy)
    solana,
  }
}