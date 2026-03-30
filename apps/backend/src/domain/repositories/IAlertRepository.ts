import type { Alert } from '@domain/entities/Alert'

export interface AlertDispatchSummary {
  channel: 'EMAIL' | 'PUSH'
  aqiValue: number
  sentAt: Date
}

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
  updateActive(alertId: string, userId: string, active: boolean): Promise<Alert | null>
  findRecentDispatchesForAlert(alertId: string, limit: number): Promise<AlertDispatchSummary[]>
  findActiveForChecker(): Promise<ActiveAlertForJob[]>
  recordDispatch(alertId: string, channel: 'EMAIL' | 'PUSH', aqiValue: number): Promise<void>
  lastDispatchAt(alertId: string): Promise<Date | null>
}
