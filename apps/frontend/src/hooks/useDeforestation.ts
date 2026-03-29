import { useQuery } from '@tanstack/react-query'
import { airQualityService } from '@services/airQualityService'
import type { DeforestationFilters } from '@app-types/airQuality.types'

export function useDeforestation(filters?: DeforestationFilters) {
  return useQuery({
    queryKey: ['deforestation', filters],
    queryFn: () => airQualityService.getDeforestation(filters),
    staleTime: 1000 * 60 * 60 * 6,
  })
}
