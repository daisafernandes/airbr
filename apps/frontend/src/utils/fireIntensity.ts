import type { TFunction } from 'i18next'

/** Human-readable intensity for popups and detail views (same i18n keys everywhere). */
export function fireIntensityLabel(intensity: number | null, t: TFunction): string {
  if (intensity === null) return t('firemap.intensityUnknown')
  if (intensity >= 70) return t('firemap.intensityHigh')
  if (intensity >= 40) return t('firemap.intensityMedium')
  return t('firemap.intensityLow')
}

export function getFireIntensityHexColor(intensity: number | null): string {
  if (intensity === null) return '#facc15'
  if (intensity >= 70) return '#ef4444'
  if (intensity >= 40) return '#ff9f4a'
  return '#facc15'
}

export function getFireMarkerRadius(intensity: number | null): number {
  if (intensity === null) return 5
  if (intensity >= 70) return 9
  if (intensity >= 40) return 7
  return 5
}
