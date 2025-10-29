'use client'

import { useState, useEffect } from 'react'
import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ExternalLink, TrendingUp, TrendingDown, Activity, Wallet } from 'lucide-react'
import ZerionSDK from '@/lib/zerion-sdk'
import { Transaction } from '@/lib/zerion-sdk/types'

interface TransactionDisplayProps {
  transaction: Transaction
}

function TransactionDisplay({ transaction }: TransactionDisplayProps) {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const formatValue = (value?: number) => {
    if (!value) return 'N/A'
    return `$${value.toLocaleString()}`
  }

  const getOperationBadgeColor = (operationType: string) => {
    switch (operationType.toLowerCase()) {
      case 'send':
        return 'destructive'
      case 'receive':
        return 'default'
      case 'trade':
        return 'secondary'
      case 'deposit':
        return 'default'
      case 'withdraw':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <CardTitle className="text-lg">
              {transaction.attributes.operation_type.charAt(0).toUpperCase() + 
               transaction.attributes.operation_type.slice(1)}
            </CardTitle>
            <Badge variant={getOperationBadgeColor(transaction.attributes.operation_type)}>
              {transaction.attributes.status}
            </Badge>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            {formatTimestamp(transaction.attributes.mined_at)}
          </div>
        </div>
        <CardDescription className="flex items-center gap-2">
          <span className="font-mono text-xs">
            {transaction.attributes.hash.slice(0, 8)}...{transaction.attributes.hash.slice(-8)}
          </span>
          <ExternalLink className="h-3 w-3" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">From:</span>
            <span className="font-mono text-xs">
              {transaction.attributes.sent_from.slice(0, 6)}...{transaction.attributes.sent_from.slice(-6)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">To:</span>
            <span className="font-mono text-xs">
              {transaction.attributes.sent_to.slice(0, 6)}...{transaction.attributes.sent_to.slice(-6)}
            </span>
          </div>
          {transaction.attributes.fee && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Fee:</span>
              <span className="text-sm">{formatValue(transaction.attributes.fee)}</span>
            </div>
          )}
          
          {transaction.attributes.transfers && transaction.attributes.transfers.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Transfers:</h4>
              <div className="space-y-2">
                {transaction.attributes.transfers.map((transfer, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      {transfer.direction === 'in' ? 
                        <TrendingUp className="h-4 w-4 text-green-500" /> : 
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      }
                      <span className="font-medium">{transfer.fungible_info.symbol}</span>
                      <span className="text-sm text-muted-foreground">{transfer.fungible_info.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {transfer.direction === 'in' ? '+' : '-'}{transfer.quantity.float.toLocaleString()}
                      </div>
                      {transfer.value && (
                        <div className="text-sm text-muted-foreground">
                          {formatValue(transfer.value)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ZerionToolFeature() {
  const { account } = useSolana()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string>('')

  // Initialize Zerion SDK
  const zerionSDK = new ZerionSDK({
    apiKey: process.env.NEXT_PUBLIC_ZERION_API_KEY || 'zk_dev_cb85020fa85242f29f36cf0fb5976320',
    timeout: 30000,
    retries: 3
  })

  // Update wallet address when account changes
  useEffect(() => {
    if (account && account.address) {
      setWalletAddress(account.address)
    }
  }, [account])

  const fetchTransactions = async () => {
    if (!walletAddress) {
      setError('No wallet address provided')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Fetching transactions for wallet:', walletAddress)
      console.log('Using getAllTransactions method...')
      console.log('Zerion SDK config:', {
          apiKey: process.env.NEXT_PUBLIC_ZERION_API_KEY ? 'Present' : 'Missing',
          baseUrl: 'https://api.zerion.io'
      })
      
      // First try to get a single page to debug
      console.log('First attempting single page request...')
      const singlePageResponse = await zerionSDK.wallets.getTransactions(walletAddress, {
        page: { size: 10 },
        filter: {
          chain_ids: ['solana']
        }
      })
      
      console.log('Single page response:', singlePageResponse)
      console.log('Response data:', singlePageResponse.data)
      console.log('Response links:', singlePageResponse.links)
      console.log('Response meta:', singlePageResponse.meta)
      
      // Now try getAllTransactions
      console.log('Now attempting getAllTransactions...')
      const allTransactions = await zerionSDK.wallets.getAllTransactions(walletAddress, {
        filter: {
          chain_ids: ['solana'] // Focus on Solana transactions
        }
      })

      console.log('Zerion API getAllTransactions response:', allTransactions)
      console.log('Total transactions found:', allTransactions.length)

      setTransactions(allTransactions)

      if (allTransactions.length === 0) {
        console.warn('No transactions found for address:', walletAddress)
        // Try without chain filter to see if there are any transactions at all
        console.log('Trying without chain filter...')
        try {
          const allChainsTransactions = await zerionSDK.wallets.getAllTransactions(walletAddress)
          console.log('All chains transactions:', allChainsTransactions.length)
          
          if (allChainsTransactions.length > 0) {
            console.log('Sample transaction from other chains:', allChainsTransactions[0])
            // Show transactions from all chains
            setTransactions(allChainsTransactions)
            setError(`Found ${allChainsTransactions.length} transactions on other chains. Showing all transactions.`)
          } else {
            setError('No transactions found for this wallet address on any network')
          }
        } catch (fallbackError) {
          console.error('Error trying to fetch all chains transactions:', fallbackError)
          setError('No Solana transactions found for this wallet address')
        }
      }

    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AppHero
        title="Zerion Tool"
        subtitle="Get wallet transaction history using Zerion API"
      >
        {!account && (
          <div style={{ display: 'inline-block' }}>
            <WalletDropdown />
          </div>
        )}
      </AppHero>

      <div className="mt-8 space-y-6">
        {/* Wallet Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Address
            </CardTitle>
            <CardDescription>
              Enter a wallet address to fetch transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <input
                type="text"
                value={walletAddress}
                onChange={handleAddressChange}
                placeholder="Enter wallet address..."
                className="flex-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
              />
              <Button 
                onClick={fetchTransactions}
                disabled={loading || !walletAddress}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Fetch Transactions'
                )}
              </Button>
            </div>
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setWalletAddress('iRHX5vUGqnHAUtGU2nvuUUqtz59cSBzatUBrNVRhboW')}
              >
                Test Solana Address
              </Button>
              {account && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setWalletAddress(account.address)}
                >
                  Use Connected Wallet
                </Button>
              )}
            </div>
            {account && (
              <div className="mt-2 text-sm text-muted-foreground">
                Connected wallet: {account.address.slice(0, 8)}...{account.address.slice(-8)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-destructive">
                <strong>Error:</strong> {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions Display */}
        {transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Showing {transactions.length} recent transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <TransactionDisplay 
                    key={transaction.id} 
                    transaction={transaction} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && transactions.length === 0 && walletAddress && !error && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Transactions Found</h3>
              <p className="text-muted-foreground">
                No transactions were found for this wallet address.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
