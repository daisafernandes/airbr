import { useQuery } from '@tanstack/react-query';
import { airQualityService } from '@services/airQualityService';
export const CITIES_QUERY_KEY = ['cities'];
export function useCities() {
    return useQuery({
        queryKey: CITIES_QUERY_KEY,
        queryFn: () => airQualityService.getCities(),
        staleTime: 1000 * 60 * 5,
    });
}
