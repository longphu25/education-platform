import { EduappAccount, getIncrementInstruction } from '@project/anchor'
import { UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { useWalletUiSignAndSend } from '@wallet-ui/react-gill'
import { useMutation } from '@tanstack/react-query'
import { toastTx } from '@/components/toast-tx'
import { useEduappAccountsInvalidate } from './use-eduapp-accounts-invalidate'

export function useEduappIncrementMutation({
  account,
  eduapp,
}: {
  account: UiWalletAccount
  eduapp: EduappAccount
}) {
  const invalidateAccounts = useEduappAccountsInvalidate()
  const signAndSend = useWalletUiSignAndSend()
  const signer = useWalletUiSigner({ account })

  return useMutation({
    mutationFn: async () => await signAndSend(getIncrementInstruction({ eduapp: eduapp.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}
