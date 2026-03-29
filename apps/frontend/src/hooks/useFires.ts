import { useQuery } from '@tanstack/react-query'
import { airQualityService } from '@services/airQualityService'
import type { FireFilters } from '@app-types/airQuality.types'

export const firesQueryKey = (filters?: FireFilters) => ['fires', filters] as const

export function useFires(filters?: FireFilters) {
  return useQuery({
    queryKey: firesQueryKey(filters),
    queryFn: () => airQualityService.getFires(filters),
    staleTime: 1000 * 60 * 60 * 3,
  })
}
