'use client'

import { usePrivyAuth } from '@/components/auth/use-privy-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, User } from 'lucide-react'

export function UserStatusCard() {
  const { authenticated, getUserDisplayName } = usePrivyAuth()
  const { account } = usePrivyAuth().solana

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Status Overview
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Privy Authentication Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">User Identity</div>
            {authenticated ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Authenticated
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3" />
                Not Authenticated
              </Badge>
            )}
          </div>
        </div>
        
        {authenticated && (
          <div className="text-xs text-gray-600 ml-4">
            Logged in as: {getUserDisplayName()}
          </div>
        )}

        {/* Solana Wallet Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Solana Wallet</div>
            {account ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3" />
                Not Connected
              </Badge>
            )}
          </div>
        </div>
        
        {account && (
          <div className="text-xs text-gray-600 ml-4 font-mono">
            {account.address.slice(0, 8)}...{account.address.slice(-8)}
          </div>
        )}

        {/* Instructions based on status */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          {!authenticated && !account && (
            <>✨ Start by authenticating with Privy, then connect your Solana wallet</>
          )}
          {authenticated && !account && (
            <>🔗 Great! Now connect your Solana wallet to interact with the program</>
          )}
          {!authenticated && account && (
            <>👤 Consider logging in with Privy for a better user experience</>
          )}
          {authenticated && account && (
            <>🎉 All set! You can now use all features of the app</>
          )}
        </div>
      </CardContent>
    </Card>
  )
}