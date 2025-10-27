import { useQueryClient } from '@tanstack/react-query'
import { useEduappAccountsQueryKey } from './use-eduapp-accounts-query-key'

export function useEduappAccountsInvalidate() {
  const queryClient = useQueryClient()
  const queryKey = useEduappAccountsQueryKey()

  return () => queryClient.invalidateQueries({ queryKey })
}
