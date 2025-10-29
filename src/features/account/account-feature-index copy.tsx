import { ReactNode } from 'react'
import { useSolana } from '@/components/solana/use-solana'
import { PrivyWalletDropdown } from '@/components/privy/privy-wallet-dropdown'

export default function AccountFeatureIndex({ redirect }: { redirect: (path: string) => ReactNode }) {
  const { account } = useSolana()

  if (account) {
    return redirect(`/account/${account.address.toString()}`)
  }

  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <PrivyWalletDropdown />
      </div>
    </div>
  )
}
