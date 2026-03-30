import type { Alert } from '@domain/entities/Alert'

export interface ActiveAlertForJob {
  alertId: string
  userId: string
  userEmail: string
  userName: string
  cityId: string
  cityName: string
  state: string
  thresholdAqi: number
  channels: Array<'EMAIL' | 'PUSH'>
}

export interface IAlertRepository {
  findByUserId(userId: string): Promise<Alert[]>
  findByIdForUser(alertId: string, userId: string): Promise<Alert | null>
  create(data: {
    userId: string
    cityId: string
    thresholdAqi: number
    channels: Array<'EMAIL' | 'PUSH'>
    active?: boolean
  }): Promise<Alert>
  delete(alertId: string, userId: string): Promise<boolean>
  findActiveForChecker(): Promise<ActiveAlertForJob[]>
  recordDispatch(alertId: string, channel: 'EMAIL' | 'PUSH', aqiValue: number): Promise<void>
  lastDispatchAt(alertId: string): Promise<Date | null>
}
