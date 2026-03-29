import { useQuery } from '@tanstack/react-query';
import { airQualityService } from '@services/airQualityService';
export const cityQueryKey = (id) => ['cities', id];
export function useCity(id) {
    return useQuery({
        queryKey: cityQueryKey(id ?? ''),
        queryFn: () => airQualityService.getCity(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });
}
