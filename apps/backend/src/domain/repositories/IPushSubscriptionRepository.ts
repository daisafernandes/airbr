export interface PushSubscriptionRecord {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

export interface IPushSubscriptionRepository {
  upsert(userId: string, data: { endpoint: string; p256dh: string; auth: string }): Promise<void>
  findByUserId(userId: string): Promise<PushSubscriptionRecord[]>
}
