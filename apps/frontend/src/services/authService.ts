import { api } from './api'

export interface AuthUser {
  id: string
  email: string
  name: string
  phone: string | null
  defaultCityId: string | null
  preferredLocale: string
  createdAt: string
  updatedAt: string
}

export type UpdateProfilePayload = {
  name?: string
  phone?: string | null
  defaultCityId?: string | null
  preferredLocale?: 'pt' | 'en' | 'es'
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

  updateProfile: async (payload: UpdateProfilePayload): Promise<AuthUser> => {
    const { data } = await api.patch<AuthUser>('/auth/me', payload)
    return data
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password })
  },
}
