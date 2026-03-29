import { useQuery } from '@tanstack/react-query'
import { airQualityService } from '@services/airQualityService'
import type { HistoryPeriod } from '@app-types/airQuality.types'

export const cityHistoryQueryKey = (id: string, period: HistoryPeriod) =>
  ['cities', id, 'history', period] as const

export function useCityHistory(id: string | null, period: HistoryPeriod = '7d') {
  return useQuery({
    queryKey: cityHistoryQueryKey(id ?? '', period),
    queryFn: () => airQualityService.getCityHistory(id!, period),
    enabled: !!id,
    staleTime: 1000 * 60 * 15,
  })
}
