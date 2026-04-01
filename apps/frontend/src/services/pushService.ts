import { api } from './api'

export const pushService = {
  getVapidPublicKey: (): Promise<{ publicKey: string | null }> =>
    api.get<{ publicKey: string | null }>('/push/vapid-public-key').then(r => r.data),

  subscribe: (body: { endpoint: string; keys: { p256dh: string; auth: string } }): Promise<void> =>
    api.post('/push/subscribe', body).then(() => undefined),
}
