import { pushService } from '@services/pushService'

const SW_REGISTRATION_WAIT_MS = 10_000

/**
 * Waits for the service worker registered by virtual:pwa-register in main.tsx.
 * Does not call register() — manual /sw.js registration breaks dev (wrong MIME) and duplicates prod.
 */
async function getServiceWorkerRegistrationForPush(): Promise<ServiceWorkerRegistration | null> {
  let reg = await navigator.serviceWorker.getRegistration()
  if (reg?.active) {
    return reg
  }

  try {
    await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), SW_REGISTRATION_WAIT_MS)
      }),
    ])
  } catch {
    // Timeout: registerSW may not have run (e.g. SW disabled) or SW still installing.
  }

  reg = await navigator.serviceWorker.getRegistration()
  return reg?.active ? reg : null
}

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
 * Subscribes to Web Push using the service worker already registered by main (vite-plugin-pwa).
 * Requires VAPID keys on the server.
 */
export async function registerPushNotifications(): Promise<{ ok: boolean; reason?: string }> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' }
  }

  const { publicKey } = await pushService.getVapidPublicKey()
  if (!publicKey) {
    return { ok: false, reason: 'no_vapid' }
  }

  const reg = await getServiceWorkerRegistrationForPush()
  if (!reg) {
    return { ok: false, reason: 'no_sw' }
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
