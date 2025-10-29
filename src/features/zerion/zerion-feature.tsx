'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Wallet, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import ZerionSDK from '@/lib/zerion-sdk'
import { ChartPeriod } from '@/lib/zerion-sdk/types'

interface WalletBalanceChartProps {
  address: string
  zerionSDK: ZerionSDK
}

function WalletBalanceChart({ address, zerionSDK }: WalletBalanceChartProps) {
  const [chartData, setChartData] = useState<Array<{ timestamp: number, value: number, date: string }>>([])
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('week')
  const [error, setError] = useState<string | null>(null)

  const periods: { value: ChartPeriod; label: string }[] = [
    { value: 'day', label: '24H' },
    { value: 'week', label: '7D' },
    { value: 'month', label: '30D' },
    { value: 'year', label: '1Y' }
  ]

  const fetchChartData = useCallback(async (period: ChartPeriod) => {
    if (!address || typeof address !== 'string') {
      console.error('Invalid address provided:', address)
      setError('Invalid wallet address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log(`Fetching ${period} chart data for wallet:`, address)
      console.log('Address type:', typeof address, 'Value:', address)
      
      const response = await zerionSDK.wallets.getChart(address, period, {
        filter: {
          chain_ids: ['solana']
        }
      })

      console.log('Chart response:', response)

      if (response.data?.attributes?.points) {
        const formattedData = response.data.attributes.points.map(([timestamp, value]) => ({
          timestamp,
          value,
          date: new Date(timestamp * 1000).toLocaleDateString()
        }))
        
        setChartData(formattedData)
      } else {
        setChartData([])
        console.warn('No chart data points found')
      }

    } catch (err) {
      console.error('Error fetching chart data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data')
      setChartData([])
    } finally {
      setLoading(false)
    }
  }, [address, zerionSDK])

  useEffect(() => {
    if (address) {
      fetchChartData(selectedPeriod)
    }
  }, [address, selectedPeriod, fetchChartData])

  const handlePeriodChange = (period: ChartPeriod) => {
    setSelectedPeriod(period)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Wallet Balance Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Wallet Balance Chart
          </CardTitle>
          <div className="flex gap-1">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodChange(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
        <CardDescription>
          Balance history for the selected time period
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center h-64 text-destructive">
            <div className="text-center">
              <p className="font-medium">Unable to load chart data</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value * 1000).toLocaleDateString()}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value * 1000).toLocaleString()}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No chart data available</p>
              <p className="text-sm mt-1">Try a different time period</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ZerionFeature() {
  const { account } = useSolana()
  const [portfolio, setPortfolio] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debug logging for account type
  useEffect(() => {
    console.log('Account changed:', {
      account,
      hasAddress: account && 'address' in account,
      address: account?.address,
      addressType: account?.address ? typeof account.address : 'undefined'
    })
  }, [account])

  // Initialize Zerion SDK
  const zerionSDK = useMemo(() => new ZerionSDK({
    apiKey: process.env.NEXT_PUBLIC_ZERION_API_KEY || 'zk_dev_cb85020fa85242f29f36cf0fb5976320',
    timeout: 30000,
    retries: 3
  }), [])

  const fetchPortfolio = useCallback(async () => {
    if (!account || !account.address) return

    const walletAddress = account.address
    if (!walletAddress || typeof walletAddress !== 'string') {
      console.error('Invalid account address provided:', account)
      setError('Invalid wallet address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Fetching portfolio for wallet:', walletAddress)
      console.log('Account address:', walletAddress)
      
      const portfolioResponse = await zerionSDK.wallets.getPortfolio(walletAddress, {
        positions: 'only_simple'
      })

      console.log('Portfolio response:', portfolioResponse)
      console.log('Portfolio data:', portfolioResponse.data)
      console.log('Portfolio attributes:', portfolioResponse.data?.attributes)
      console.log('Total positions:', portfolioResponse.data?.attributes?.total?.positions)
      console.log('Position distribution:', portfolioResponse.data?.attributes?.positions_distribution_by_type)
      setPortfolio(portfolioResponse.data)

    } catch (err) {
      console.error('Error fetching portfolio:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data')
    } finally {
      setLoading(false)
    }
  }, [account, zerionSDK])

  useEffect(() => {
    if (account) {
      fetchPortfolio()
    }
  }, [account, fetchPortfolio])

  const formatValue = (value?: number) => {
    if (value === undefined || value === null) return '$0.00'
    if (value === 0) return '$0.00'
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatPercentage = (value?: number) => {
    if (!value) return '0.00%'
    const formatted = (value * 100).toFixed(2)
    return `${value >= 0 ? '+' : ''}${formatted}%`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AppHero
        title="Zerion Portfolio"
        subtitle={
          account
            ? "Portfolio overview and balance analytics"
            : 'Connect your wallet to view portfolio data'
        }
      >
        {!account && (
          <div style={{ display: 'inline-block' }}>
            <WalletDropdown />
          </div>
        )}
      </AppHero>

      {/* Wallet Info Section */}
      {account && (
        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Connected Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Address:</span>
                  <span className="font-mono text-sm">
                    {account.address.slice(0, 8)}...{account.address.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Chain:</span>
                  <Badge variant="secondary">Solana Main-Net</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Full Address:</span>
                  <span className="font-mono text-xs break-all">
                    {account.address}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Portfolio Overview
                </CardTitle>
                <Button 
                  onClick={fetchPortfolio}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Refresh'
                  )}
                </Button>
              </div>
              <CardDescription>
                Current portfolio value and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-destructive mb-2">
                    <strong>Error:</strong> {error}
                  </div>
                  <Button onClick={fetchPortfolio} size="sm">
                    Try Again
                  </Button>
                </div>
              ) : portfolio ? (
                <div className="space-y-6">
                  {/* Main Portfolio Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {formatValue((portfolio as any).attributes?.total?.positions)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Value</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold flex items-center justify-center gap-1">
                        {(portfolio as any).attributes?.changes?.absolute_1d !== undefined ? (
                          <>
                            {(portfolio as any).attributes.changes.absolute_1d >= 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            {formatValue((portfolio as any).attributes.changes.absolute_1d)}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">24H Change</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {(portfolio as any).attributes?.changes?.percent_1d !== undefined ? (
                          <span className={(portfolio as any).attributes.changes.percent_1d >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {formatPercentage((portfolio as any).attributes.changes.percent_1d)}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">24H %</div>
                    </div>
                  </div>

                  {/* Position Distribution */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Position Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {formatValue((portfolio as any).attributes?.positions_distribution_by_type?.wallet)}
                        </div>
                        <div className="text-xs text-muted-foreground">Wallet</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          {formatValue((portfolio as any).attributes?.positions_distribution_by_type?.deposited)}
                        </div>
                        <div className="text-xs text-muted-foreground">Deposited</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <div className="text-lg font-bold text-red-600">
                          {formatValue((portfolio as any).attributes?.positions_distribution_by_type?.borrowed)}
                        </div>
                        <div className="text-xs text-muted-foreground">Borrowed</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <div className="text-lg font-bold text-orange-600">
                          {formatValue((portfolio as any).attributes?.positions_distribution_by_type?.locked)}
                        </div>
                        <div className="text-xs text-muted-foreground">Locked</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {formatValue((portfolio as any).attributes?.positions_distribution_by_type?.staked)}
                        </div>
                        <div className="text-xs text-muted-foreground">Staked</div>
                      </div>
                    </div>
                  </div>

                  {/* Chain Distribution */}
                  {(portfolio as any).attributes?.positions_distribution_by_chain && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Chain Distribution</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries((portfolio as any).attributes.positions_distribution_by_chain).map(([chain, value]) => (
                          <div key={chain} className="text-center p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                            <div className="text-lg font-bold text-indigo-600">
                              {formatValue(value as number)}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {chain}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No portfolio data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Balance Chart */}
          {account && (
            <WalletBalanceChart 
              address={account.address} 
              zerionSDK={zerionSDK}
            />
          )}
        </div>
      )}
    </div>
  )
}
