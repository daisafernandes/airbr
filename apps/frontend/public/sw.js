/* global self, clients */
self.addEventListener('push', (event) => {
  let data = { title: 'AirBR', body: '', url: '/' }
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() }
    }
  } catch {
    /* use defaults */
  }
  const options = {
    body: data.body,
    data: { url: data.url || '/' },
  }
  event.waitUntil(self.registration.showNotification(data.title || 'AirBR', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
      return undefined
    }),
  )
})
