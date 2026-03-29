import { useMutation, useQueryClient } from '@tanstack/react-query'

import { userService } from '@services/userService'
import { CreateUserPayload } from '@types/user.types'

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
