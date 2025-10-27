import { useSolana } from '@/components/solana/use-solana'

export function useEduappAccountsQueryKey() {
  const { cluster } = useSolana()

  return ['eduapp', 'accounts', { cluster }]
}
