import 'i18next'
import type translation from '@/locales/pt/translation.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof translation }
  }
}
