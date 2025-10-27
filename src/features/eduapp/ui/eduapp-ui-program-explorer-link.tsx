import { EDUAPP_PROGRAM_ADDRESS } from '@project/anchor'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

export function EduappUiProgramExplorerLink() {
  return <AppExplorerLink address={EDUAPP_PROGRAM_ADDRESS} label={ellipsify(EDUAPP_PROGRAM_ADDRESS)} />
}
