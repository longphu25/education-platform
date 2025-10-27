import { EduappAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { useEduappIncrementMutation } from '../data-access/use-eduapp-increment-mutation'

export function EduappUiButtonIncrement({ account, eduapp }: { account: UiWalletAccount; eduapp: EduappAccount }) {
  const incrementMutation = useEduappIncrementMutation({ account, eduapp })

  return (
    <Button variant="outline" onClick={() => incrementMutation.mutateAsync()} disabled={incrementMutation.isPending}>
      Increment
    </Button>
  )
}
