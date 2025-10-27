import { EduappAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

import { useEduappDecrementMutation } from '../data-access/use-eduapp-decrement-mutation'

export function EduappUiButtonDecrement({ account, eduapp }: { account: UiWalletAccount; eduapp: EduappAccount }) {
  const decrementMutation = useEduappDecrementMutation({ account, eduapp })

  return (
    <Button variant="outline" onClick={() => decrementMutation.mutateAsync()} disabled={decrementMutation.isPending}>
      Decrement
    </Button>
  )
}
