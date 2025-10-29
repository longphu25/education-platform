'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { type ReactNode } from 'react'
import { privyConfig, getPrivyAppId } from '@/lib/privy-config'

interface PrivyAuthProviderProps {
  children: ReactNode
}

export function PrivyAuthProvider({ children }: PrivyAuthProviderProps) {
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