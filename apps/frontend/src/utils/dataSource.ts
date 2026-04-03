/** City catalog source (e.g. Prisma `City.source`). */
export function isDevelopmentSource(source: string | null | undefined): boolean {
  if (source == null || source === '') return false
  const s = source.toLowerCase()
  return s === 'seed' || s.startsWith('seed-')
}

/** AQI reading source (e.g. `AqiReading.source`). */
export function isDevelopmentReadingSource(source: string | null | undefined): boolean {
  if (source == null || source === '') return false
  const s = source.toLowerCase()
  return s === 'seed' || s === 'seed-mock' || s.startsWith('seed-')
}
