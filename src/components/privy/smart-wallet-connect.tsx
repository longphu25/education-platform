'use client'

import { useSolana } from '@/components/solana/use-solana'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  LogOut, 
  UserCheck, 
  Mail, 
  Phone, 
  Shield, 
  Plus,
  Loader2,
  CheckCircle,
  ExternalLink
} from 'lucide-react'

export function SmartWalletConnect() {
  const { 
    ready, 
    authenticated, 
    user, 
    login, 
    logout, 
    walletType,
    loginMethod,
    isCreatingWallet,
    externalWallet,
    embeddedWallet,
    createEmbeddedWallet
  } = useSolana()

  if (!ready) {
    return (
      <Button disabled variant="outline" className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (!authenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <UserCheck className="h-5 w-5" />
            Connect with Privy
          </CardTitle>
          <CardDescription>
            Choose your preferred login method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={login} 
            className="w-full gap-2"
            variant="default"
          >
            <UserCheck className="h-4 w-4" />
            Login with Email/Social/Wallet
          </Button>
          
          <div className="text-xs text-gray-500 space-y-1">
            <div>📧 <strong>Email/Social:</strong> Auto-creates Solana wallet</div>
            <div>🔗 <strong>Wallet:</strong> Uses your existing wallet</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show wallet creation progress
  if (isCreatingWallet) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Creating Your Wallet
          </CardTitle>
          <CardDescription>
            Setting up your embedded Solana wallet...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Shield className="h-4 w-4" />
            Secure wallet generation in progress
          </div>
        </CardContent>
      </Card>
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

  const displayName = getDisplayName()

  // Render different UI based on wallet type
  const renderWalletInfo = () => {
    if (walletType === 'external' && externalWallet) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="gap-1">
              <ExternalLink className="h-3 w-3" />
              External Wallet
            </Badge>
            <Badge variant="secondary">{loginMethod}</Badge>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900">Connected Wallet</div>
            <div className="text-xs text-blue-700 font-mono mt-1">
              {externalWallet.address.slice(0, 8)}...{externalWallet.address.slice(-8)}
            </div>
          </div>
          
          <div className="text-xs text-gray-600">
            🔗 Using your existing Solana wallet for all transactions
          </div>
        </div>
      )
    }

    if (walletType === 'embedded' && embeddedWallet) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="gap-1">
              <Shield className="h-3 w-3" />
              Embedded Wallet
            </Badge>
            <Badge variant="secondary">{loginMethod}</Badge>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-900">Generated Wallet</div>
            <div className="text-xs text-green-700 font-mono mt-1">
              {embeddedWallet.address.slice(0, 8)}...{embeddedWallet.address.slice(-8)}
            </div>
          </div>
          
          <div className="text-xs text-gray-600">
            🔒 Secure embedded wallet created automatically for you
          </div>

          <Button
            onClick={createEmbeddedWallet}
            variant="outline"
            size="sm"
            className="gap-2 w-full"
          >
            <Plus className="h-4 w-4" />
            Create Additional Wallet
          </Button>
        </div>
      )
    }

    return (
      <div className="text-xs text-gray-500">
        Setting up wallet...
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarFallback>
            {walletType === 'external' ? (
              <ExternalLink className="h-4 w-4" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg flex items-center gap-2">
            Connected
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardTitle>
          <CardDescription>
            {displayName}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="space-y-2">
          {user?.linkedAccounts?.find(account => account.type === 'email') && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              <span>Email verified</span>
            </div>
          )}
          {user?.linkedAccounts?.find(account => account.type === 'phone') && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" />
              <span>Phone verified</span>
            </div>
          )}
        </div>

        {/* Wallet Information */}
        {renderWalletInfo()}

        {/* Actions */}
        <div className="flex justify-end pt-2 border-t">
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