import { createRoot } from 'react-dom/client'
// eslint-disable-next-line import/no-unresolved -- provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register'

import { App } from './App'
import './styles/global.css'

if (import.meta.env.PROD) {
  registerSW({ immediate: true })
} else if ('serviceWorker' in navigator) {
  // Avoid stale cache issues during local development.
  navigator.serviceWorker
    .getRegistrations()
    .then(registrations => {
      registrations.forEach(registration => {
        registration.unregister()
      })
    })
    .catch(() => {})
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html contains <div id="root">.')
}

createRoot(rootElement).render(
  <App />,
)
