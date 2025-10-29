import { useWalletUi } from '@wallet-ui/react'
import { useWalletUiGill } from '@wallet-ui/react-gill'

export type WalletType = 'embedded' | 'external' | null;
export type LoginMethod = 'email' | 'phone' | 'social' | 'wallet' | null;

/**
 * Custom hook to abstract Wallet UI and related functionality from your app.
 *
 * This is a great place to add custom shared Solana logic or clients.
 */
export function useSolana() {
  const walletUi = useWalletUi()
  const client = useWalletUiGill()

  return {
    ...walletUi,
    client,
  }
}