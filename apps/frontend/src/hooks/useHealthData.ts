import { useQuery } from '@tanstack/react-query'
import { airQualityService } from '@services/airQualityService'

export function useHealthData(cityId: string | null) {
  return useQuery({
    queryKey: ['health-data', cityId],
    queryFn: () => airQualityService.getHealthData(cityId!),
    enabled: !!cityId,
    staleTime: 1000 * 60 * 60 * 24,
  })
}
