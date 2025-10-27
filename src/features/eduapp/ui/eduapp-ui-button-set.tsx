import { EduappAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

import { useEduappSetMutation } from '@/features/eduapp/data-access/use-eduapp-set-mutation'

export function EduappUiButtonSet({ account, eduapp }: { account: UiWalletAccount; eduapp: EduappAccount }) {
  const setMutation = useEduappSetMutation({ account, eduapp })

  return (
    <Button
      variant="outline"
      onClick={() => {
        const value = window.prompt('Set value to:', eduapp.data.count.toString() ?? '0')
        if (!value || parseInt(value) === eduapp.data.count || isNaN(parseInt(value))) {
          return
        }
        return setMutation.mutateAsync(parseInt(value))
      }}
      disabled={setMutation.isPending}
    >
      Set
    </Button>
  )
}
