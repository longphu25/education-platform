import { EduappAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

import { useEduappCloseMutation } from '@/features/eduapp/data-access/use-eduapp-close-mutation'

export function EduappUiButtonClose({ account, eduapp }: { account: UiWalletAccount; eduapp: EduappAccount }) {
  const closeMutation = useEduappCloseMutation({ account, eduapp })

  return (
    <Button
      variant="destructive"
      onClick={() => {
        if (!window.confirm('Are you sure you want to close this account?')) {
          return
        }
        return closeMutation.mutateAsync()
      }}
      disabled={closeMutation.isPending}
    >
      Close
    </Button>
  )
}
