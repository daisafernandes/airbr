import axios, { AxiosError } from 'axios'

import { ApiError } from '@app-types/api.types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('@airbr:token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  (error: AxiosError<ApiError>) => {
    const url = error.config?.url ?? ''
    const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/register')
    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('@airbr:token')
      localStorage.removeItem('@airbr:user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
