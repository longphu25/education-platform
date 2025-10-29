'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, Wallet, User, Mail, Phone, ExternalLink, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { WalletTroubleshooter } from '@/components/wallet-troubleshooter'

export default function PrivyDemoPage() {
  const { 
    ready, 
    authenticated, 
    user, 
    login, 
    logout, 
    linkEmail,
    linkWallet,
    unlinkEmail,
    unlinkWallet,
    exportWallet,
    createWallet,
  } = usePrivy()

  // Get embedded wallets from user object
  const wallets = user?.linkedAccounts?.filter(account => 
    account.type === 'wallet' && account.chainType === 'solana'
  ) || []

  const [isCreatingWallet, setIsCreatingWallet] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleCreateWallet = async () => {
    setIsCreatingWallet(true)
    try {
      await createWallet()
      toast.success('Wallet created successfully!')
    } catch (error) {
      toast.error('Failed to create wallet')
      console.error('Create wallet error:', error)
    } finally {
      setIsCreatingWallet(false)
    }
  }

  const handleExportWallet = async () => {
    setIsExporting(true)
    try {
      await exportWallet()
      toast.success('Wallet export initiated')
    } catch (error) {
      toast.error('Failed to export wallet')
      console.error('Export wallet error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading Privy...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <Wallet className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Privy Demo
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Connect with email, social accounts, or Solana wallets
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Choose how you&apos;d like to authenticate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={login} 
                className="w-full"
                size="lg"
              >
                Connect Wallet or Sign In
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Supports: Email, SMS, Social (Google, Twitter, etc.), and Solana wallets (Phantom, Solflare, etc.)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Privy Demo Dashboard</h1>
            <p className="text-muted-foreground">
              Explore Privy&apos;s authentication and wallet features
            </p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        <Tabs defaultValue="user" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="user">User Info</TabsTrigger>
            <TabsTrigger value="wallets">Wallets</TabsTrigger>
            <TabsTrigger value="accounts">Link Accounts</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="troubleshoot">Debug</TabsTrigger>
          </TabsList>

          {/* User Info Tab */}
          <TabsContent value="user" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">User ID</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {user?.id}
                      </code>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(user?.id || '')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Created At</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {user?.email && (
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <span>{user.email.address}</span>
                      <Badge variant="default">
                        Email Linked
                      </Badge>
                    </div>
                  </div>
                )}

                {user?.phone && (
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <span>{user.phone.number}</span>
                      <Badge variant="default">
                        Phone Linked
                      </Badge>
                    </div>
                  </div>
                )}

                {user?.google && (
                  <div>
                    <label className="text-sm font-medium">Google Account</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.google.email}
                    </p>
                  </div>
                )}

                {user?.twitter && (
                  <div>
                    <label className="text-sm font-medium">Twitter Account</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      @{user.twitter.username}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallets Tab */}
          <TabsContent value="wallets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Solana Wallets ({wallets.length})
                </CardTitle>
                <CardDescription>
                  Manage your Solana wallets and create new ones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateWallet} 
                    disabled={isCreatingWallet}
                  >
                    {isCreatingWallet ? 'Creating...' : 'Create New Wallet'}
                  </Button>
                  {wallets.length > 0 && (
                    <Button 
                      onClick={handleExportWallet} 
                      variant="outline"
                      disabled={isExporting}
                    >
                      {isExporting ? 'Exporting...' : 'Export Wallet'}
                    </Button>
                  )}
                </div>

                {wallets.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No wallets found. Create your first Solana wallet to get started.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {wallets.map((wallet, index: number) => {
                      const walletData = wallet as unknown as {address?: string; walletClientType?: string}
                      return (
                        <Card key={walletData.address || index} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Wallet {index + 1}</span>
                                <Badge variant="default">
                                  {walletData.walletClientType === 'privy' ? 'Embedded' : 'Solana Wallet'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {walletData.address || 'N/A'}
                                </code>
                                {walletData.address && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => copyToClipboard(walletData.address || '')}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => window.open(`https://explorer.solana.com/address/${walletData.address}?cluster=devnet`, '_blank')}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Link Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Link Accounts</CardTitle>
                  <CardDescription>
                    Connect additional accounts to your profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {!user?.email && (
                    <Button onClick={linkEmail} variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Link Email
                    </Button>
                  )}
                  <Button onClick={linkWallet} variant="outline" className="w-full">
                    <Wallet className="h-4 w-4 mr-2" />
                    Link Wallet
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Unlink Accounts</CardTitle>
                  <CardDescription>
                    Remove connected accounts from your profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {user?.email && (
                    <Button onClick={() => unlinkEmail(user.email!.address)} variant="destructive" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Unlink Email
                    </Button>
                  )}
                  {wallets.length > 0 && (
                    <Button 
                      onClick={() => unlinkWallet((wallets[0] as unknown as {address: string}).address)} 
                      variant="destructive" 
                      className="w-full"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Unlink Wallet
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Actions</CardTitle>
                <CardDescription>
                  Additional wallet and account management features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    More advanced features like transaction signing, token transfers, and dApp interactions can be added here.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" disabled>
                    Sign Message (Coming Soon)
                  </Button>
                  <Button variant="outline" disabled>
                    Send Transaction (Coming Soon)
                  </Button>
                  <Button variant="outline" disabled>
                    Token Transfer (Coming Soon)
                  </Button>
                  <Button variant="outline" disabled>
                    NFT Actions (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Troubleshoot Tab */}
          <TabsContent value="troubleshoot">
            <WalletTroubleshooter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}