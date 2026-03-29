import { useQuery } from '@tanstack/react-query'
import { airQualityService } from '@services/airQualityService'
import type { RankingFilters } from '@app-types/airQuality.types'

export const rankingQueryKey = (filters?: RankingFilters) => ['ranking', filters] as const

export function useRanking(filters?: RankingFilters) {
  return useQuery({
    queryKey: rankingQueryKey(filters),
    queryFn: () => airQualityService.getRanking(filters),
    staleTime: 1000 * 60 * 5,
  })
}
