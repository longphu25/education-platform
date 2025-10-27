import { EduappUiCard } from './eduapp-ui-card'
import { useEduappAccountsQuery } from '@/features/eduapp/data-access/use-eduapp-accounts-query'
import { UiWalletAccount } from '@wallet-ui/react'

export function EduappUiList({ account }: { account: UiWalletAccount }) {
  const eduappAccountsQuery = useEduappAccountsQuery()

  if (eduappAccountsQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!eduappAccountsQuery.data?.length) {
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No accounts</h2>
        No accounts found. Initialize one to get started.
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {eduappAccountsQuery.data?.map((eduapp) => (
        <EduappUiCard account={account} key={eduapp.address} eduapp={eduapp} />
      ))}
    </div>
  )
}
