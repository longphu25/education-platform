import { EduappAccount } from '@project/anchor'
import { ellipsify, UiWalletAccount } from '@wallet-ui/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { EduappUiButtonClose } from './eduapp-ui-button-close'
import { EduappUiButtonDecrement } from './eduapp-ui-button-decrement'
import { EduappUiButtonIncrement } from './eduapp-ui-button-increment'
import { EduappUiButtonSet } from './eduapp-ui-button-set'

export function EduappUiCard({ account, eduapp }: { account: UiWalletAccount; eduapp: EduappAccount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Eduapp: {eduapp.data.count}</CardTitle>
        <CardDescription>
          Account: <AppExplorerLink address={eduapp.address} label={ellipsify(eduapp.address)} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-evenly">
          <EduappUiButtonIncrement account={account} eduapp={eduapp} />
          <EduappUiButtonSet account={account} eduapp={eduapp} />
          <EduappUiButtonDecrement account={account} eduapp={eduapp} />
          <EduappUiButtonClose account={account} eduapp={eduapp} />
        </div>
      </CardContent>
    </Card>
  )
}
