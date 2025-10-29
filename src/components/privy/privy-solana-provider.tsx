'use client'

import { ReactNode } from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { privyConfig, getPrivyAppId } from '@/lib/privy-config'

interface PrivySolanaProviderProps {
  children: ReactNode
}

export function PrivySolanaProvider({ children }: PrivySolanaProviderProps) {
  const appId = getPrivyAppId()

  if (!appId) {
    console.warn('Privy not configured - running without Privy authentication')
    return <>{children}</>
  }

  return (
    <PrivyProvider
      appId={appId}
      config={privyConfig}
    >
      {children}
    </PrivyProvider>
  )
}