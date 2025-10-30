'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWalletUi } from '@wallet-ui/react'
import { useWalletUiGill } from '@wallet-ui/react-gill'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  getPurchaseCreditsInstructionAsync,
  fetchProgramConfig,
} from '../../../anchor/src/client/js/academic-chain'
import { address, createSolanaRpc, createSolanaRpcSubscriptions, sendAndConfirmTransactionFactory } from 'gill'

const ACADEMIC_CHAIN_PROGRAM_ID = '9HuNte7WjS8GVHBKpE42y1QXq4C7e6uNvtjmDRM1G99F'
const DEVNET_RPC_URL = 'https://api.devnet.solana.com'

export function PurchaseCreditsComponent() {
  const { account, connected } = useWalletUi()
  const { transactionSigner } = useWalletUiGill()
  const [amount, setAmount] = useState('10')

  // Fetch program config to get credit price and treasury info
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['academic-chain-config'],
    queryFn: async () => {
      const rpc = createSolanaRpc(DEVNET_RPC_URL)
      const configPda = await getProgramDerivedAddress({
        programAddress: address(ACADEMIC_CHAIN_PROGRAM_ID),
        seeds: [new TextEncoder().encode('config')],
      })
      
      const configAccount = await fetchProgramConfig(rpc, configPda)
      return configAccount
    },
    enabled: connected,
    refetchInterval: 30000, // Refetch every 30s
  })

  // Purchase credits mutation
  const purchaseCredits = useMutation({
    mutationFn: async (creditAmount: number) => {
      if (!account || !transactionSigner || !config) {
        throw new Error('Wallet not connected or config not loaded')
      }

      const rpc = createSolanaRpc(DEVNET_RPC_URL)
      const rpcSubscriptions = createSolanaRpcSubscriptions(DEVNET_RPC_URL.replace('https', 'wss'))

      // Get the purchase credits instruction
      const instruction = await getPurchaseCreditsInstructionAsync({
        student: transactionSigner,
        treasury: config.data.treasury,
        creditMint: config.data.creditMint,
        amount: BigInt(creditAmount),
      })

      // Build transaction
      const { value: latestBlockhash } = await rpc.getLatestBlockhash().send()
      
      const transaction = {
        version: 0,
        instructions: [instruction],
        feePayer: transactionSigner.address,
        lifetimeConstraint: {
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
      }

      // Send and confirm transaction
      const sendAndConfirm = sendAndConfirmTransactionFactory({
        rpc,
        rpcSubscriptions,
      })

      const signature = await sendAndConfirm(transaction, {
        commitment: 'confirmed',
        skipPreflight: false,
      })

      return { signature, amount: creditAmount }
    },
    onSuccess: (data) => {
      toast.success(`Successfully purchased ${data.amount} credits!`, {
        description: `Transaction: ${data.signature}`,
        action: {
          label: 'View on Explorer',
          onClick: () => {
            window.open(
              `https://explorer.solana.com/tx/${data.signature}?cluster=devnet`,
              '_blank'
            )
          },
        },
      })
      setAmount('10') // Reset amount
    },
    onError: (error) => {
      console.error('Purchase credits error:', error)
      toast.error('Failed to purchase credits', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    },
  })

  const handlePurchase = () => {
    const creditAmount = parseInt(amount)
    if (isNaN(creditAmount) || creditAmount <= 0) {
      toast.error('Invalid amount', {
        description: 'Please enter a valid number of credits',
      })
      return
    }
    purchaseCredits.mutate(creditAmount)
  }

  // Calculate total cost
  const calculateCost = () => {
    if (!config || !amount) return null
    const creditAmount = parseInt(amount)
    if (isNaN(creditAmount)) return null
    
    const creditPriceInLamports = Number(config.data.creditPrice)
    const totalLamports = creditPriceInLamports * creditAmount
    const totalSol = totalLamports / 1_000_000_000
    
    return totalSol.toFixed(4)
  }

  if (!connected) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="text-muted-foreground">
          Please connect your wallet to purchase credits
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Purchase Credits</h2>
        <p className="text-muted-foreground">
          Buy academic credits to register for courses
        </p>
      </div>

      {configLoading ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Loading program config...</p>
        </div>
      ) : config ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Credit Price:</span>
              <span className="text-sm">
                {(Number(config.data.creditPrice) / 1_000_000_000).toFixed(4)} SOL
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Treasury:</span>
              <span className="text-xs font-mono">
                {String(config.data.treasury).slice(0, 8)}...{String(config.data.treasury).slice(-8)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Number of Credits</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={purchaseCredits.isPending}
            />
            {calculateCost() && (
              <p className="text-sm text-muted-foreground">
                Total Cost: {calculateCost()} SOL
              </p>
            )}
          </div>

          <Button
            onClick={handlePurchase}
            disabled={purchaseCredits.isPending || !amount}
            className="w-full"
          >
            {purchaseCredits.isPending ? 'Processing...' : 'Purchase Credits'}
          </Button>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-destructive">Failed to load program config</p>
        </div>
      )}
    </div>
  )
}

// Helper function to derive PDA (if not exported from client)
async function getProgramDerivedAddress(params: {
  programAddress: ReturnType<typeof address>
  seeds: Uint8Array[]
}) {
  const { programAddress, seeds } = params
  
  // Use the gill library's getProgramDerivedAddress
  const { getProgramDerivedAddress: getPda } = await import('gill')
  
  return getPda({
    programAddress,
    seeds: seeds.map(seed => ({
      kind: 'const' as const,
      value: seed,
    })),
  })
}
