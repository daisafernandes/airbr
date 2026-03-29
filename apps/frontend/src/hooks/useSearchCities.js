import { useQuery } from '@tanstack/react-query';
import { airQualityService } from '@services/airQualityService';
export const searchQueryKey = (q) => ['cities', 'search', q];
export function useSearchCities(q) {
    return useQuery({
        queryKey: searchQueryKey(q),
        queryFn: () => airQualityService.searchCities(q),
        enabled: q.trim().length > 0,
        staleTime: 1000 * 60 * 5,
        placeholderData: [],
    });
}
