'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useSolana } from '@/components/solana/use-solana'
import { usePrivy } from '@privy-io/react-auth'
import { Wallet, User, Mail, Phone, Chrome } from 'lucide-react'

function WalletAvatar({ className, type }: { className?: string; type?: string }) {
  const iconMap = {
    email: Mail,
    sms: Phone,
    google: Chrome,
    wallet: Wallet,
    embedded: User,
    external: Wallet,
  }
  
  const IconComponent = iconMap[type as keyof typeof iconMap] || User

  return (
    <Avatar className={cn('rounded-md h-6 w-6', className)}>
      <AvatarFallback>
        <IconComponent className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  )
}

function PrivyWalletDropdown() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { account, walletType, loginMethod } = useSolana()

  if (!ready) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    )
  }

  if (!authenticated || !user) {
    return (
      <Button variant="outline" onClick={login}>
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    )
  }

  const ellipsify = (str: string, len = 4) => {
    if (str.length <= len * 2) return str
    return `${str.slice(0, len)}...${str.slice(-len)}`
  }

  const getDisplayName = () => {
    if (loginMethod === 'wallet' && account?.address) {
      return ellipsify(account.address)
    }
    if (user?.email?.address) {
      return ellipsify(user.email.address, 6)
    }
    if (user?.phone?.number) {
      return user.phone.number
    }
    if (user?.google?.email) {
      return ellipsify(user.google.email, 6)
    }
    return 'User'
  }

  const copyAddress = async () => {
    if (account?.address) {
      await navigator.clipboard.writeText(account.address)
    }
  }

  const getWalletTypeBadge = () => {
    if (walletType === 'embedded') {
      return (
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          Embedded
        </span>
      )
    }
    return (
      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
        External
      </span>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <WalletAvatar type={loginMethod || walletType || undefined} />
          {getDisplayName()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Wallet Info</span>
            {getWalletTypeBadge()}
          </div>
          
          {account?.address && (
            <div className="text-xs text-muted-foreground mb-2">
              <div>Address:</div>
              <div className="font-mono break-all">{ellipsify(account.address, 8)}</div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            <div>Login: {loginMethod || 'Unknown'}</div>
            <div>Type: {walletType || 'Unknown'}</div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {account?.address && (
          <>
            <DropdownMenuItem className="cursor-pointer" onClick={copyAddress}>
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem className="cursor-pointer" onClick={logout}>
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { PrivyWalletDropdown }