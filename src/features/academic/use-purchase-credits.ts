/**
 * Hook for purchasing academic credits using wallet connection
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWalletUi, useWalletUiSigner, type UiWalletAccount } from '@wallet-ui/react'
import { useSolana } from '@/components/solana/use-solana'
import {
  purchaseCredits,
  getProgramConfiguration,
  getStudentProfile,
  lamportsToSol,
  getExplorerUrl,
  DEVNET_RPC_URL,
} from '@/lib/academic-chain-client'
import type { Address } from 'gill'

export interface UsePurchaseCreditsOptions {
  account: UiWalletAccount
  rpcUrl?: string
  onSuccess?: (result: { signature: string; amount: number }) => void
  onError?: (error: Error) => void
}

export function usePurchaseCredits(options: UsePurchaseCreditsOptions) {
  const { account, rpcUrl: rpcUrlOverride, onSuccess, onError } = options
  const { connected } = useWalletUi()
  const { client } = useSolana()
  const queryClient = useQueryClient()
  const transactionSigner = useWalletUiSigner({ account })
  const rpcUrl = rpcUrlOverride || DEVNET_RPC_URL
  const accountAddress = account.address as Address

  console.log('🔗 usePurchaseCredits initialized:', {
    connected,
    accountAddress: accountAddress?.slice(0, 8) + '...',
    signerAddress: transactionSigner?.address?.slice(0, 8) + '...',
    hasAccount: !!account,
    hasSigner: !!transactionSigner,
  })

  // Fetch program config
  const {
    data: config,
    isLoading: configLoading,
    error: configError,
  } = useQuery({
    queryKey: ['academic-chain-config', rpcUrl],
    queryFn: async () => {
      try {
        return await getProgramConfiguration(rpcUrl)
      } catch (error) {
        console.error('❌ Failed to fetch program configuration:', error)
        throw error
      }
    },
    enabled: connected,
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: 30000, // Refetch every 30s
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Fetch student profile
  const {
    data: studentProfile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['student-profile', accountAddress, rpcUrl],
    queryFn: () => getStudentProfile(accountAddress as Address, rpcUrl),
    enabled: connected && !!accountAddress,
    staleTime: 30000,
    retry: 2,
  })

  // Purchase mutation
  const mutation = useMutation({
    mutationFn: async (amount: number) => {
      // Validation checks
      if (!connected) {
        throw new Error('Wallet not connected. Please connect your wallet first.')
      }

      if (!account || !accountAddress) {
        throw new Error('No wallet account found. Please reconnect your wallet.')
      }

      if (!transactionSigner) {
        throw new Error('Transaction signer not available. Please reconnect your wallet.')
      }

      if (!transactionSigner.address) {
        throw new Error('Signer address not found. Please reconnect your wallet.')
      }

      if (amount <= 0) {
        throw new Error('Amount must be greater than 0')
      }

      if (!Number.isInteger(amount)) {
        throw new Error('Amount must be a whole number')
      }

      console.log('🛒 Starting purchase transaction:', {
        amount,
        accountAddress: accountAddress.slice(0, 8) + '...',
        signerAddress: transactionSigner.address.slice(0, 8) + '...',
      })

      try {
        const result = await purchaseCredits({
          student: transactionSigner as import('gill').TransactionSigner,
          amount,
          rpcUrl,
          rpc: client.rpc, // Pass the RPC client from wallet-ui
        })

        console.log('✅ Purchase successful:', {
          signature: result.signature,
          amount: result.amount,
          totalCost: result.totalCost.toString(),
        })

        return result
      } catch (error) {
        console.error('❌ Purchase failed:', error)
        throw error
      }
    },
    onSuccess: (result) => {
      console.log('🎉 Purchase mutation succeeded, invalidating caches...')
      
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['student-profile', accountAddress, rpcUrl],
      })

      // Also refetch the profile immediately
      refetchProfile()

      onSuccess?.(result)
    },
    onError: (error) => {
      console.error('💥 Purchase mutation error:', error)
      onError?.(error as Error)
    },
    retry: false, // Don't auto-retry purchases
  })

  // Calculate cost for given amount
  const calculateCost = (amount: number): string | null => {
    if (!config || !amount || amount <= 0) return null

    const totalLamports = config.data.creditPrice * BigInt(amount)
    return lamportsToSol(totalLamports)
  }

  // Get credit price in SOL
  const creditPriceInSol = config
    ? lamportsToSol(config.data.creditPrice)
    : null

  return {
    // State
    connected,
    account: accountAddress,
    config,
    configLoading,
    configError,
    studentProfile,
    profileLoading,
    creditPriceInSol,

    // Actions
    purchaseCredits: mutation.mutate,
    purchaseCreditsAsync: mutation.mutateAsync,
    refetchProfile,

    // Mutation state
    isPurchasing: mutation.isPending,
    purchaseError: mutation.error,
    purchaseSuccess: mutation.isSuccess,
    lastPurchase: mutation.data,

    // Utilities
    calculateCost,
    getExplorerUrl: (signature: string) => getExplorerUrl(signature, 'devnet'),
    
    // Wallet validation
    isWalletReady: connected && !!transactionSigner && !!accountAddress,
    walletStatus: {
      connected,
      hasAccount: !!account,
      hasSigner: !!transactionSigner,
      hasAddress: !!accountAddress,
    },
  }
}

/**
 * Hook to get student statistics
 */
export function useStudentStats(studentAddress?: string, rpcUrl?: string) {
  const { account } = useWalletUi()
  const addressToUse = studentAddress || account?.address

  const { data: profile, ...queryState } = useQuery({
    queryKey: ['student-profile', addressToUse, rpcUrl],
    queryFn: () => getStudentProfile(addressToUse as Address, rpcUrl),
    enabled: !!addressToUse,
    staleTime: 30000,
  })

  return {
    totalCreditsPurchased: profile?.data.totalCreditsPurchased || 0n,
    creditsSpent: profile?.data.totalCreditsSpent || 0n,
    coursesCompleted: profile?.data.coursesCompleted || 0,
    graduationNft: profile?.data.graduationNft,
    createdAt: profile?.data.createdAt
      ? new Date(Number(profile.data.createdAt) * 1000)
      : null,
    hasProfile: !!profile,
    ...queryState,
  }
}

/**
 * Hook to get program info
 */
export function useAcademicChainProgram(rpcUrl?: string) {
  const { data: config, ...queryState } = useQuery({
    queryKey: ['academic-chain-config', rpcUrl],
    queryFn: () => getProgramConfiguration(rpcUrl),
    staleTime: 300000, // Cache for 5 minutes
  })

  return {
    creditPrice: config?.data.creditPrice,
    creditPriceInSol: config ? lamportsToSol(config.data.creditPrice) : null,
    treasury: config?.data.treasury,
    creditMint: config?.data.creditMint,
    authority: config?.data.authority,
    config,
    ...queryState,
  }
}
