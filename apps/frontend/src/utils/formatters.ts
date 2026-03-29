import i18n from '@/lib/i18n'

const LOCALE_MAP: Record<string, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
}

function getLocale(): string {
  return LOCALE_MAP[i18n.language] ?? 'pt-BR'
}

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat(getLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString))
}

export const formatDateTime = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  return date.toLocaleString(getLocale(), options)
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}
