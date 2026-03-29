import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@services/userService';
export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => userService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
