import { EduappAccount, getDecrementInstruction } from '@project/anchor'
import { useMutation } from '@tanstack/react-query'
import { UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { useWalletUiSignAndSend } from '@wallet-ui/react-gill'
import { toastTx } from '@/components/toast-tx'
import { useEduappAccountsInvalidate } from './use-eduapp-accounts-invalidate'

export function useEduappDecrementMutation({
  account,
  eduapp,
}: {
  account: UiWalletAccount
  eduapp: EduappAccount
}) {
  const invalidateAccounts = useEduappAccountsInvalidate()
  const signer = useWalletUiSigner({ account })
  const signAndSend = useWalletUiSignAndSend()

  return useMutation({
    mutationFn: async () => await signAndSend(getDecrementInstruction({ eduapp: eduapp.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}
