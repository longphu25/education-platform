import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { EduappUiButtonInitialize } from './ui/eduapp-ui-button-initialize'
import { EduappUiList } from './ui/eduapp-ui-list'
import { EduappUiProgramExplorerLink } from './ui/eduapp-ui-program-explorer-link'
import { EduappUiProgramGuard } from './ui/eduapp-ui-program-guard'

export default function EduappFeature() {
  const { account } = useSolana()

  return (
    <EduappUiProgramGuard>
      <AppHero
        title="Eduapp"
        subtitle={
          account
            ? "Initialize a new eduapp onchain by clicking the button. Use the program's methods (increment, decrement, set, and close) to change the state of the account."
            : 'Select a wallet to run the program.'
        }
      >
        <p className="mb-6">
          <EduappUiProgramExplorerLink />
        </p>
        {account ? (
          <EduappUiButtonInitialize account={account} />
        ) : (
          <div style={{ display: 'inline-block' }}>
            <WalletDropdown />
          </div>
        )}
      </AppHero>
      {account ? <EduappUiList account={account} /> : null}
    </EduappUiProgramGuard>
  )
}
