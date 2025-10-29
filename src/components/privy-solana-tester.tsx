'use client'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useState, useEffect, useCallback } from 'react'


import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { debugWalletConnection } from '@/lib/privy-config'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Wallet, 
  RefreshCw,
  Settings,
  Zap
} from 'lucide-react'

export function PrivySolanaConnectionTester() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets: allWallets } = useWallets()
  
  // For now, use all wallets (Privy configuration is Solana-only anyway)
  const wallets = allWallets

  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testResults, setTestResults] = useState<{
    devnetConnected: boolean
    walletDetected: boolean
    transactionReady: boolean
    error?: string
  }>({
    devnetConnected: false,
    walletDetected: false,
    transactionReady: false
  })

  // Test Solana devnet connection
  const testSolanaConnection = useCallback(async () => {
    setConnectionStatus('testing')
    
    try {
      // Test devnet RPC connection
      const response = await fetch('https://api.devnet.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getVersion',
        }),
      })
      
      const data = await response.json()
      const devnetConnected = !!data.result
      
      // Check wallet status
      const walletDetected = wallets.length > 0
      const transactionReady = walletDetected && authenticated
      
      setTestResults({
        devnetConnected,
        walletDetected,
        transactionReady,
      })
      
      setConnectionStatus(devnetConnected ? 'success' : 'error')
    } catch (error) {
      console.error('Connection test failed:', error)
      setTestResults({
        devnetConnected: false,
        walletDetected: false,
        transactionReady: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      setConnectionStatus('error')
    }
  }, [wallets.length, authenticated])

  const handleCreateWallet = async () => {
    console.log('Wallet creation not available in this version')
    // Note: createWallet is not available in useWallets hook
    // Wallets are created automatically during login for users without wallets
  }

  const runDebugInfo = () => {
    debugWalletConnection()
  }

  useEffect(() => {
    if (ready) {
      testSolanaConnection()
    }
  }, [ready, wallets.length, testSolanaConnection])

  if (!ready) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Privy Solana Connection Tester</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Initializing Privy...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Privy Solana Devnet Connection Test
          </CardTitle>
          <CardDescription>
            Test your Privy configuration for Solana devnet connectivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Authentication Status</div>
              <div className="text-sm text-muted-foreground">
                {authenticated ? `Logged in as: ${user?.id?.slice(0, 8)}...` : 'Not authenticated'}
              </div>
            </div>
            {authenticated ? (
              <Badge className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Disconnected
              </Badge>
            )}
          </div>

          {/* Connection Test Results */}
          <div className="space-y-2">
            <h4 className="font-medium">Connection Test Results</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Devnet RPC</div>
                  <div className="text-xs text-muted-foreground">api.devnet.solana.com</div>
                </div>
                {testResults.devnetConnected ? (
                  <Badge className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Offline
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Solana Wallets</div>
                  <div className="text-xs text-muted-foreground">{wallets.length} detected</div>
                </div>
                {testResults.walletDetected ? (
                  <Badge className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Ready
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    None
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Transaction Ready</div>
                  <div className="text-xs text-muted-foreground">Can sign & send</div>
                </div>
                {testResults.transactionReady ? (
                  <Badge className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Ready
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Not Ready
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {testResults.error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Connection Error:</strong> {testResults.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button 
              onClick={testSolanaConnection} 
              disabled={connectionStatus === 'testing'}
              variant="outline"
            >
              {connectionStatus === 'testing' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retest Connection
                </>
              )}
            </Button>

            {!authenticated ? (
              <Button onClick={login}>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <Button onClick={logout} variant="outline">
                Disconnect
              </Button>
            )}

            {authenticated && wallets.length === 0 && (
              <Button 
                onClick={handleCreateWallet} 
                disabled
                variant="outline"
              >
                Auto-create on Login
              </Button>
            )}

            <Button onClick={runDebugInfo} variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Debug Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Details */}
      {wallets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Solana Wallets ({wallets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wallets.map((wallet, index: number) => (
                <div key={wallet.address} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Wallet {index + 1}</div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {wallet.address}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Type: {wallet.connectorType === 'embedded' ? 'Embedded' : 'External'}
                    </div>
                  </div>
                  <Badge variant="outline">
                    Devnet
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Network:</span>
            <Badge>devnet</Badge>
          </div>
          <div className="flex justify-between">
            <span>RPC Endpoint:</span>
            <code className="text-xs">https://api.devnet.solana.com</code>
          </div>
          <div className="flex justify-between">
            <span>WebSocket:</span>
            <code className="text-xs">wss://api.devnet.solana.com</code>
          </div>
          <div className="flex justify-between">
            <span>Privy App ID:</span>
            <code className="text-xs">{process.env.NEXT_PUBLIC_PRIVY_APP_ID?.slice(0, 10)}...</code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}