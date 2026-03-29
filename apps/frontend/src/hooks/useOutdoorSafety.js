import { useQuery } from '@tanstack/react-query';
import { airQualityService } from '@services/airQualityService';
export function useOutdoorSafety(cityId) {
    return useQuery({
        queryKey: ['outdoor-safety', cityId],
        queryFn: () => airQualityService.getOutdoorSafety(cityId),
        enabled: !!cityId,
        staleTime: 1000 * 60 * 60,
    });
}
