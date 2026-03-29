import { useQuery } from '@tanstack/react-query';
import { airQualityService } from '@services/airQualityService';
export const cityHistoryQueryKey = (id, period) => ['cities', id, 'history', period];
export function useCityHistory(id, period = '7d') {
    return useQuery({
        queryKey: cityHistoryQueryKey(id ?? '', period),
        queryFn: () => airQualityService.getCityHistory(id, period),
        enabled: !!id,
        staleTime: 1000 * 60 * 15,
    });
}
