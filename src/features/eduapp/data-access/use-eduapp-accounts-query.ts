import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { getEduappProgramAccounts } from '@project/anchor'
import { useEduappAccountsQueryKey } from './use-eduapp-accounts-query-key'

export function useEduappAccountsQuery() {
  const { client } = useSolana()

  return useQuery({
    queryKey: useEduappAccountsQueryKey(),
    queryFn: async () => await getEduappProgramAccounts(client.rpc),
  })
}
