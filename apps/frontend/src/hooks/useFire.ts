import { useQuery } from '@tanstack/react-query'

import { airQualityService } from '@services/airQualityService'

export const fireQueryKey = (id: string | undefined) => ['fire', id] as const

export function useFire(id: string | undefined) {
  return useQuery({
    queryKey: fireQueryKey(id),
    queryFn: () => airQualityService.getFireById(id!),
    enabled: typeof id === 'string' && id.length > 0,
    staleTime: 1000 * 60 * 60 * 3,
    retry: (count, err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404) return false
      return count < 1
    },
  })
}
