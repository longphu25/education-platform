'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { debugWalletConnection, getPrivyAppId } from '@/lib/privy-config'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Wallet, 
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react'

interface WalletInfo {
  name: string
  installed: boolean
  property: string
}

export function WalletTroubleshooter() {
  const { ready, authenticated, user, login } = usePrivy()
  const [walletInfo, setWalletInfo] = useState<WalletInfo[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isHttps, setIsHttps] = useState(false)
  const [isLocalhost, setIsLocalhost] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const checkWallets = () => {
    if (typeof window === 'undefined') return

    const windowWithWallets = window as unknown as {
      solana?: { isPhantom?: boolean; isBackpack?: boolean }
      solflare?: unknown
      solong?: unknown
      backpack?: unknown
      slope?: unknown
      mathWallet?: unknown
      coin98?: unknown
      clover?: unknown
    }

    setWalletInfo([
      {
        name: 'Phantom',
        installed: !!windowWithWallets.solana?.isPhantom,
        property: 'window.solana.isPhantom'
      },
      {
        name: 'Backpack',
        installed: !!windowWithWallets.backpack || !!windowWithWallets.solana?.isBackpack,
        property: 'window.backpack'
      },
      {
        name: 'Solflare',
        installed: !!windowWithWallets.solflare,
        property: 'window.solflare'
      },
      {
        name: 'Slope',
        installed: !!windowWithWallets.slope,
        property: 'window.slope'
      },
      {
        name: 'Solong',
        installed: !!windowWithWallets.solong,
        property: 'window.solong'
      },
      {
        name: 'Math Wallet',
        installed: !!windowWithWallets.mathWallet,
        property: 'window.mathWallet'
      },
      {
        name: 'Coin98',
        installed: !!windowWithWallets.coin98,
        property: 'window.coin98'
      },
      {
        name: 'Clover',
        installed: !!windowWithWallets.clover,
        property: 'window.clover'
      }
    ])
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    checkWallets()
    debugWalletConnection()
    
    // Give some time for wallet detection
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  // Set client-side values to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
    setIsHttps(window.location.protocol === 'https:')
    setIsLocalhost(window.location.hostname === 'localhost')
    checkWallets()
  }, [])

  const installedWallets = walletInfo.filter(wallet => wallet.installed)
  const appId = getPrivyAppId()

  // Show loading until client-side values are set to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Wallet Connection Troubleshooter</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Wallet Connection Troubleshooter</h1>
        <p className="text-muted-foreground">
          Diagnose and fix wallet connection issues with Privy
        </p>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Privy Ready</span>
            {ready ? (
              <Badge className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Ready
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Loading
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>Authentication Status</span>
            {authenticated ? (
              <Badge className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Authenticated
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Not Authenticated
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>Privy App ID</span>
            {appId ? (
              <Badge className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Configured
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Missing
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>Connection Security</span>
            {isHttps || isLocalhost ? (
              <Badge className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {isHttps ? 'HTTPS' : 'Localhost'}
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                HTTP (Insecure)
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wallet Detection */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Installed Wallets ({installedWallets.length})
            </CardTitle>
            <CardDescription>
              Detected Solana wallets in your browser
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {walletInfo.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Checking for installed wallets...
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {walletInfo.map((wallet) => (
                <div
                  key={wallet.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {wallet.property}
                    </div>
                  </div>
                  {wallet.installed ? (
                    <Badge className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Installed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Not Found
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Troubleshooting Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!appId && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Missing Privy App ID:</strong> Add NEXT_PUBLIC_PRIVY_APP_ID to your .env.local file
              </AlertDescription>
            </Alert>
          )}

          {installedWallets.length === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>No wallets detected:</strong> Install a Solana wallet like Phantom, Backpack, or Solflare
              </AlertDescription>
            </Alert>
          )}

          {!isHttps && !isLocalhost && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Insecure connection:</strong> Wallets require HTTPS or localhost for security
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h4 className="font-medium">Common Solutions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Refresh the page after installing a wallet</li>
              <li>• Make sure your wallet is unlocked</li>
              <li>• Try connecting from an incognito/private window</li>
              <li>• Disable other wallet extensions temporarily</li>
              <li>• Check that the wallet supports Solana</li>
              <li>• Ensure you&apos;re on the correct network (mainnet/devnet)</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://phantom.app/', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Install Phantom
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://backpack.app/', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Install Backpack
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://solflare.com/', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Install Solflare
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Test Connection</CardTitle>
          <CardDescription>
            Try connecting with Privy to test wallet integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authenticated ? (
            <div className="text-center space-y-2">
              <Badge className="text-lg p-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                Successfully Connected!
              </Badge>
              {user && (
                <div className="text-sm text-muted-foreground">
                  User ID: {user.id}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <Button onClick={login} size="lg" disabled={!ready}>
                {ready ? 'Test Wallet Connection' : 'Loading...'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}