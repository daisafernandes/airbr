import { useQuery } from '@tanstack/react-query';
import { airQualityService } from '@services/airQualityService';
export const firesQueryKey = (filters) => ['fires', filters];
export function useFires(filters) {
    return useQuery({
        queryKey: firesQueryKey(filters),
        queryFn: () => airQualityService.getFires(filters),
        staleTime: 1000 * 60 * 60 * 3,
    });
}
