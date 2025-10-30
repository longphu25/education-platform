'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { usePurchaseCredits, useStudentStats, useAcademicChainProgram } from './use-purchase-credits'
import { Card } from '@/components/ui/card'
import { useWalletUi, type UiWalletAccount } from '@wallet-ui/react'

export function PurchaseCreditsCard() {
  const { connected, account } = useWalletUi()

  if (!connected || !account) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Connect wallet to purchase credits</p>
      </Card>
    )
  }

  return <PurchaseCreditsCardConnected account={account} />
}

function PurchaseCreditsCardConnected({ account }: { account: UiWalletAccount }) {
  const [amount, setAmount] = useState('10')

  const {
    purchaseCredits,
    isPurchasing,
    calculateCost,
    getExplorerUrl,
    isWalletReady,
    walletStatus,
    configError,
  } = usePurchaseCredits({
    account,
    onSuccess: (result) => {
      toast.success(`Successfully purchased ${result.amount} credits!`, {
        description: 'Transaction confirmed on Solana',
        action: {
          label: 'View on Explorer',
          onClick: () => window.open(getExplorerUrl(result.signature), '_blank'),
        },
        duration: 10000,
      })
      setAmount('10')
    },
    onError: (error) => {
      console.error('❌ Purchase error in component:', error)
      toast.error('Purchase failed', {
        description: error.message || 'An unexpected error occurred',
        duration: 8000,
      })
    },
  })

  const { creditPriceInSol, isLoading: programLoading } = useAcademicChainProgram()
  const { totalCreditsPurchased, isLoading: statsLoading } = useStudentStats(account.address)
  const parsedAmount = parseInt(amount, 10)
  const totalCost = Number.isNaN(parsedAmount) ? null : calculateCost(parsedAmount)

  const handlePurchase = () => {
    // Validation
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Invalid amount', {
        description: 'Please enter a valid number greater than 0',
      })
      return
    }

    if (!isWalletReady) {
      toast.error('Wallet not ready', {
        description: 'Please ensure your wallet is properly connected',
      })
      console.error('Wallet status:', walletStatus)
      return
    }

    console.log('🛒 Purchase button clicked:', {
      amount: parsedAmount,
      isWalletReady,
      walletStatus,
    })
    
    purchaseCredits(parsedAmount)
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Purchase Credits</h2>
        <p className="text-sm text-muted-foreground">
          Buy academic credits for course registration
        </p>
      </div>

      {programLoading ? (
        <div className="py-8 text-center text-muted-foreground">Loading...</div>
      ) : configError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="font-semibold text-destructive mb-2">⚠️ Program Not Initialized</p>
          <p className="text-sm text-muted-foreground mb-4">
            The academic chain program has not been initialized yet. This needs to be done by an administrator.
          </p>
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Technical Details
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {String(configError)}
            </pre>
          </details>
        </div>
      ) : (
        <>
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Credit Price:</span>
              <span className="font-mono">{creditPriceInSol} SOL</span>
            </div>
            {!statsLoading && (
              <div className="flex justify-between text-sm">
                <span className="font-medium">Credits Owned:</span>
                <span className="font-mono">{totalCreditsPurchased.toString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Number of Credits</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isPurchasing}
              />
              {totalCost && (
                <p className="text-sm text-muted-foreground">
                  Total: {totalCost} SOL
                </p>
              )}
            </div>

            <Button
              onClick={handlePurchase}
              disabled={isPurchasing || Number.isNaN(parsedAmount) || parsedAmount <= 0}
              className="w-full"
            >
              {isPurchasing ? 'Processing...' : 'Purchase Credits'}
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}
