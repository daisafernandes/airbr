/** Matches frontend `normalizeAppLocale` — supported notification languages. */
export type AppLocaleCode = 'pt' | 'en' | 'es'

export function normalizeAlertLocale(input: string | null | undefined): AppLocaleCode {
  const lower = (input ?? 'pt').toLowerCase()
  if (lower.startsWith('en')) return 'en'
  if (lower.startsWith('es')) return 'es'
  return 'pt'
}

export function buildAqiAlertNotification(params: {
  preferredLocale: string | null | undefined
  cityName: string
  state: string
  aqi: number
  thresholdAqi: number
}): { title: string; body: string } {
  const lang = normalizeAlertLocale(params.preferredLocale)
  const { cityName, state, aqi, thresholdAqi } = params
  switch (lang) {
    case 'en':
      return {
        title: `Air quality alert: ${cityName} (${state})`,
        body: `AQI is ${aqi}, at or above your threshold of ${thresholdAqi}.`,
      }
    case 'es':
      return {
        title: `Alerta de calidad del aire: ${cityName} (${state})`,
        body: `El AQI está en ${aqi}, igual o por encima de tu umbral de ${thresholdAqi}.`,
      }
    default:
      return {
        title: `Alerta de qualidade do ar: ${cityName} (${state})`,
        body: `O IQAr está em ${aqi}, igual ou acima do seu limite de ${thresholdAqi}.`,
      }
  }
}
