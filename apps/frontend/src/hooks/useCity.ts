import { useQuery } from '@tanstack/react-query'
import { airQualityService } from '@services/airQualityService'

export const cityQueryKey = (id: string) => ['cities', id] as const

export function useCity(id: string | null) {
  return useQuery({
    queryKey: cityQueryKey(id ?? ''),
    queryFn: () => airQualityService.getCity(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
