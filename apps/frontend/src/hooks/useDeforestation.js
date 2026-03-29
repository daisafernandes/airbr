import { useQuery } from '@tanstack/react-query';
import { airQualityService } from '@services/airQualityService';
export function useDeforestation(filters) {
    return useQuery({
        queryKey: ['deforestation', filters],
        queryFn: () => airQualityService.getDeforestation(filters),
        staleTime: 1000 * 60 * 60 * 6,
    });
}
