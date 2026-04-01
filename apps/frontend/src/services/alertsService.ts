import { api } from './api'

export type AlertChannel = 'EMAIL' | 'PUSH'

export interface AlertDispatchDto {
  channel: AlertChannel
  aqiValue: number
  sentAt: string
}

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
  recentDispatches?: AlertDispatchDto[]
}

interface AlertListResponse {
  data: AlertDto[]
}

export const alertsService = {
  list: (): Promise<AlertDto[]> =>
    api.get<AlertDto[] | AlertListResponse>('/alerts').then(r => {
      if (Array.isArray(r.data)) {
        return r.data
      }
      return Array.isArray(r.data.data) ? r.data.data : []
    }),

  create: (payload: {
    cityId: string
    thresholdAqi: number
    channels: AlertChannel[]
    active?: boolean
  }): Promise<AlertDto> => api.post<AlertDto>('/alerts', payload).then(r => r.data),

  remove: (id: string): Promise<void> => api.delete(`/alerts/${id}`).then(() => undefined),

  setActive: (id: string, active: boolean): Promise<AlertDto> =>
    api.patch<AlertDto>(`/alerts/${id}`, { active }).then(r => r.data),
}
