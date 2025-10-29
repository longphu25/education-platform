'use client'

import { usePrivyAuth } from './use-privy-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, UserCheck, Mail, Phone } from 'lucide-react'

export function PrivyLoginButton() {
  const { ready, authenticated, login, logout, isLoading, getUserDisplayName, getUserEmail, getUserPhone } = usePrivyAuth()

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
        disabled={isLoading}
        className="gap-2"
        variant="default"
      >
        <UserCheck className="h-4 w-4" />
        {isLoading ? 'Connecting...' : 'Login with Privy'}
      </Button>
    )
  }

  const displayName = getUserDisplayName()
  const email = getUserEmail()
  const phone = getUserPhone()

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarFallback>
            {email?.charAt(0).toUpperCase() || displayName?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">Authenticated</CardTitle>
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
          {!email && !phone && (
            <div className="text-sm text-gray-500">
              Social login authenticated
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button
            onClick={logout}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}