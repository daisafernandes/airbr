import { api } from './api'

export interface AuthUser {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: AuthUser }> => {
    const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/login', { email, password })
    return data
  },

  register: async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ token: string; user: AuthUser }> => {
    const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/register', {
      email,
      password,
      name,
    })
    return data
  },

  me: async (): Promise<AuthUser> => {
    const { data } = await api.get<AuthUser>('/auth/me')
    return data
  },
}
