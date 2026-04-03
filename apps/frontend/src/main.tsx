import { createRoot } from 'react-dom/client'
// eslint-disable-next-line import/no-unresolved -- provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register'

import { App } from './App'
import './styles/global.css'

// Single registration path via vite-plugin-pwa (injectManifest → sw.ts). Push uses
// navigator.serviceWorker.ready; do not unregister SWs in dev or push cannot attach.
registerSW({ immediate: true })

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html contains <div id="root">.')
}

createRoot(rootElement).render(
  <App />,
)
