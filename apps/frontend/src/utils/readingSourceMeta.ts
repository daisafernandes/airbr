import type { TFunction } from 'i18next'

/** Public URLs for official / reference networks (optional link in UI). */
export const READING_SOURCE_URLS: Partial<Record<string, string>> = {
  cetesb: 'https://cetesb.sp.gov.br/qualar/',
  iema: 'https://iema.es.gov.br/',
  iat: 'https://iat.pr.gov.br/',
  'open-meteo': 'https://open-meteo.com/',
  aqicn: 'https://waqi.info/',
  openweathermap: 'https://openweathermap.org/api',
}

function normalizeKey(source: string | null | undefined): string {
  return (source ?? '').trim().toLowerCase()
}

/**
 * Display label uses i18n `readingSources.<key>.name`; falls back to the raw source string.
 */
export function getReadingSourceDisplay(
  t: TFunction,
  source: string | null | undefined,
): { label: string; url: string | undefined } {
  const key = normalizeKey(source)
  if (!key) {
    return { label: '—', url: undefined }
  }
  const label = t(`readingSources.${key}.name`, { defaultValue: source ?? key })
  const url = READING_SOURCE_URLS[key]
  return { label, url }
}
