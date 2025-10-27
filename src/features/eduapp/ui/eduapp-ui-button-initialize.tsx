import { Button } from '@/components/ui/button'
import { UiWalletAccount } from '@wallet-ui/react'

import { useEduappInitializeMutation } from '@/features/eduapp/data-access/use-eduapp-initialize-mutation'

export function EduappUiButtonInitialize({ account }: { account: UiWalletAccount }) {
  const mutationInitialize = useEduappInitializeMutation({ account })

  return (
    <Button onClick={() => mutationInitialize.mutateAsync()} disabled={mutationInitialize.isPending}>
      Initialize Eduapp {mutationInitialize.isPending && '...'}
    </Button>
  )
}
