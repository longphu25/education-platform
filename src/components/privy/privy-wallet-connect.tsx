'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, UserCheck, Wallet, Mail, Phone } from 'lucide-react'

export function PrivyWalletConnect() {
  const { ready, authenticated, user, login, logout } = usePrivy()

  if (!ready) {
    return (
      <Button disabled variant="outline">
        Loading...
      </Button>
    )
  }

  if (!authenticated) {
    return (
      <Button 
        onClick={login} 
        className="gap-2"
        variant="default"
      >
        <UserCheck className="h-4 w-4" />
        Connect with Privy
      </Button>
    )
  }

  // Get user display information
  const getDisplayName = () => {
    if (!user) return 'Privy User'
    
    const emailAccount = user.linkedAccounts?.find(account => account.type === 'email')
    if (emailAccount && 'address' in emailAccount) return emailAccount.address
    
    const phoneAccount = user.linkedAccounts?.find(account => account.type === 'phone')
    if (phoneAccount && 'number' in phoneAccount) return phoneAccount.number
    
    const socialAccount = user.linkedAccounts?.find(account => 
      ['google_oauth', 'twitter_oauth', 'discord_oauth', 'github_oauth', 'linkedin_oauth'].includes(account.type)
    )
    if (socialAccount) return `${socialAccount.type.replace('_oauth', '')} user`
    
    return 'Privy User'
  }

  const getEmail = () => {
    if (!user) return null
    const emailAccount = user.linkedAccounts?.find(account => account.type === 'email')
    return emailAccount && 'address' in emailAccount ? emailAccount.address : null
  }

  const getPhone = () => {
    if (!user) return null
    const phoneAccount = user.linkedAccounts?.find(account => account.type === 'phone')
    return phoneAccount && 'number' in phoneAccount ? phoneAccount.number : null
  }

  const displayName = getDisplayName()
  const email = getEmail()
  const phone = getPhone()

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarFallback>
            <Wallet className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">Connected via Privy</CardTitle>
          <CardDescription>
            {displayName}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="space-y-2">
          {email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" />
              <span>{phone}</span>
            </div>
          )}
          
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            🔒 Authenticated with Privy
            <br />
            💡 Embedded Solana wallet support coming soon
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}