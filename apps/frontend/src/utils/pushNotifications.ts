import { pushService } from '@services/pushService'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i += 1) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

/**
 * Registers the app service worker and subscribes to Web Push when VAPID keys are configured on the server.
 */
export async function registerPushNotifications(): Promise<{ ok: boolean; reason?: string }> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' }
  }

  const { publicKey } = await pushService.getVapidPublicKey()
  if (!publicKey) {
    return { ok: false, reason: 'no_vapid' }
  }

  let reg = await navigator.serviceWorker.getRegistration()
  if (!reg) {
    reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return { ok: false, reason: 'denied' }
  }

  const existing = await reg.pushManager.getSubscription()
  if (existing) {
    await pushService.subscribe(existing.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } })
    return { ok: true }
  }

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
  })

  const json = sub.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return { ok: false, reason: 'invalid_subscription' }
  }

  await pushService.subscribe({
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  })

  return { ok: true }
}
