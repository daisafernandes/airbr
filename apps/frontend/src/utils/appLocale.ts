/** Maps i18n / API locale strings (e.g. en-US) to app-supported codes. */
export function normalizeAppLocale(input: string): 'pt' | 'en' | 'es' {
  const lower = input.toLowerCase()
  if (lower.startsWith('en')) return 'en'
  if (lower.startsWith('es')) return 'es'
  return 'pt'
}
