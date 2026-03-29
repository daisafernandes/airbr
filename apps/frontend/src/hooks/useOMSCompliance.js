import { useQuery } from '@tanstack/react-query';
import { airQualityService } from '@services/airQualityService';
export function useOMSCompliance() {
    return useQuery({
        queryKey: ['oms-compliance'],
        queryFn: () => airQualityService.getOMSCompliance(),
        staleTime: 1000 * 60 * 60,
    });
}
