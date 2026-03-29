import type { ICacheService } from '@domain/cache/ICacheService'
import type { IAqiRepository } from '@domain/repositories/IAqiRepository'
import type { FireFocusData, IFireRepository } from '@domain/repositories/IFireRepository'

const TTL_1_HOUR = 60 * 60
const NEARBY_FIRE_RADIUS_KM = 300

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function compassLabel(deg: number): string {
  const dirs = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO']
  return dirs[Math.round(deg / 45) % 8] ?? 'N'
}

export interface WindSmokeResult {
  city: { id: string; lat: number; lng: number }
  wind: {
    direction: number | null
    speed: number | null
    compassLabel: string | null
  }
  nearbyFires: Array<{
    lat: number
    lng: number
    intensity: number | null
    biome: string | null
    distanceKm: number
  }>
}

export class WindSmokeService {
  constructor(
    private readonly aqiRepository: IAqiRepository,
    private readonly fireRepository: IFireRepository,
    private readonly cache: ICacheService,
  ) {}

  async getWindSmoke(cityId: string, cityLat: number, cityLng: number): Promise<WindSmokeResult> {
    const key = `wind-smoke:${cityId}`
    const cached = this.cache.get<WindSmokeResult>(key)
    if (cached) return cached

    const [latestReading, fires] = await Promise.all([
      this.aqiRepository.findLatestByCity(cityId),
      this.fireRepository.findActive(48),
    ])

    const nearbyFires = fires
      .map((f: FireFocusData) => ({
        ...f,
        distanceKm: haversineKm(cityLat, cityLng, f.lat, f.lng),
      }))
      .filter(f => f.distanceKm <= NEARBY_FIRE_RADIUS_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 50)
      .map(f => ({
        lat: f.lat,
        lng: f.lng,
        intensity: f.intensity,
        biome: f.biome,
        distanceKm: Math.round(f.distanceKm),
      }))

    const wind = latestReading?.windDirection != null
      ? {
          direction: latestReading.windDirection,
          speed: latestReading.windSpeed,
          compassLabel: compassLabel(latestReading.windDirection),
        }
      : { direction: null, speed: null, compassLabel: null }

    const result: WindSmokeResult = {
      city: { id: cityId, lat: cityLat, lng: cityLng },
      wind,
      nearbyFires,
    }

    this.cache.set(key, result, TTL_1_HOUR)
    return result
  }
}
