import type { ICacheService } from '@domain/cache/ICacheService'
import type { IAqiRepository } from '@domain/repositories/IAqiRepository'

const TTL_1_HOUR = 60 * 60

function aqiScore(aqi: number): number {
  if (aqi <= 50) return 100
  if (aqi <= 100) return 80
  if (aqi <= 150) return 55
  if (aqi <= 200) return 30
  if (aqi <= 300) return 10
  return 0
}

function uvScore(uv: number): number {
  if (uv <= 2) return 100
  if (uv <= 5) return 75
  if (uv <= 7) return 50
  if (uv <= 10) return 25
  return 0
}

function pollenScore(pollen: number): number {
  if (pollen <= 20) return 100
  if (pollen <= 50) return 75
  if (pollen <= 100) return 50
  if (pollen <= 200) return 25
  return 0
}

function tempScore(temp: number): number {
  if (temp >= 18 && temp <= 28) return 100
  if (temp >= 12 && temp < 18) return 80
  if (temp > 28 && temp <= 34) return 70
  if (temp >= 8 && temp < 12) return 50
  if (temp > 34 && temp <= 38) return 40
  return 20
}

export interface OutdoorSafetyResult {
  score: number
  level: 'seguro' | 'moderado' | 'arriscado'
  breakdown: {
    aqi: number | null
    uv: number | null
    pollen: number | null
    temperature: number | null
    aqiScore: number
    uvScore: number
    pollenScore: number
    tempScore: number
  }
}

export class OutdoorSafetyService {
  constructor(
    private readonly aqiRepository: IAqiRepository,
    private readonly cache: ICacheService,
  ) {}

  async getOutdoorSafety(cityId: string): Promise<OutdoorSafetyResult> {
    const key = `outdoor-safety:${cityId}`
    const cached = this.cache.get<OutdoorSafetyResult>(key)
    if (cached) return cached

    const reading = await this.aqiRepository.findLatestByCity(cityId)

    const aqi = reading?.aqi ?? 100
    const uv = reading?.uv ?? 5
    const pollen = reading?.pollen ?? 50
    const temp = reading?.temperature ?? 25

    const aqiS = aqiScore(aqi)
    const uvS = uvScore(uv)
    const pollenS = pollenScore(pollen)
    const tempS = tempScore(temp)

    const score = Math.round(aqiS * 0.5 + uvS * 0.25 + pollenS * 0.15 + tempS * 0.1)
    const level: OutdoorSafetyResult['level'] =
      score >= 70 ? 'seguro' : score >= 40 ? 'moderado' : 'arriscado'

    const result: OutdoorSafetyResult = {
      score,
      level,
      breakdown: {
        aqi: reading?.aqi ?? null,
        uv: reading?.uv ?? null,
        pollen: reading?.pollen ?? null,
        temperature: reading?.temperature ?? null,
        aqiScore: aqiS,
        uvScore: uvS,
        pollenScore: pollenS,
        tempScore: tempS,
      },
    }

    this.cache.set(key, result, TTL_1_HOUR)
    return result
  }
}
