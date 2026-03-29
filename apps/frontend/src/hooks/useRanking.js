import { useQuery } from '@tanstack/react-query';
import { airQualityService } from '@services/airQualityService';
export const rankingQueryKey = (filters) => ['ranking', filters];
export function useRanking(filters) {
    return useQuery({
        queryKey: rankingQueryKey(filters),
        queryFn: () => airQualityService.getRanking(filters),
        staleTime: 1000 * 60 * 5,
    });
}
