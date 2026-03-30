import webpush from 'web-push'

import { env } from '@infrastructure/config/env'

let vapidConfigured = false

function ensureVapidConfigured(): boolean {
  if (vapidConfigured) {
    return true
  }
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    return false
  }
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY)
  vapidConfigured = true
  return true
}

export class WebPushSender {
  async send(
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: string,
  ): Promise<void> {
    if (!ensureVapidConfigured()) {
      if (env.NODE_ENV === 'development') {
        console.warn('[Push] VAPID keys not configured; skipping web push')
      }
      return
    }

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      payload,
    )
  }
}
