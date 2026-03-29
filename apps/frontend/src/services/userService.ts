import { CreateUserPayload, User } from '@types/user.types'

import { api } from './api'

export const userService = {
  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await api.post<User>('/users', payload)
    return data
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`)
    return data
  },
}
