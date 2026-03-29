import { useQuery } from '@tanstack/react-query';
import { airQualityService } from '@services/airQualityService';
export function useWindSmoke(cityId) {
    return useQuery({
        queryKey: ['wind-smoke', cityId],
        queryFn: () => airQualityService.getWindSmoke(cityId),
        enabled: !!cityId,
        staleTime: 1000 * 60 * 60,
    });
}
