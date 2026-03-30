import { api } from './api'

export type AlertChannel = 'EMAIL' | 'PUSH'

export interface AlertDto {
  id: string
  userId: string
  cityId: string
  thresholdAqi: number
  channels: AlertChannel[]
  active: boolean
  createdAt: string
  updatedAt: string
  cityName: string | null
  state: string | null
}

export const alertsService = {
  list: (): Promise<AlertDto[]> => api.get<AlertDto[]>('/alerts').then(r => r.data),

  create: (payload: {
    cityId: string
    thresholdAqi: number
    channels: AlertChannel[]
    active?: boolean
  }): Promise<AlertDto> => api.post<AlertDto>('/alerts', payload).then(r => r.data),

  remove: (id: string): Promise<void> => api.delete(`/alerts/${id}`).then(() => undefined),
}
