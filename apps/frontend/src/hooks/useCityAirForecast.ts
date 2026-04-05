import { useQuery } from '@tanstack/react-query'

import { airQualityService } from '@services/airQualityService'

export function useCityAirForecast(cityId: string | null) {
  return useQuery({
    queryKey: ['air-quality-forecast', cityId],
    queryFn: () => airQualityService.getAirQualityForecast(cityId!),
    enabled: !!cityId,
    staleTime: 1000 * 60 * 60,
  })
}
