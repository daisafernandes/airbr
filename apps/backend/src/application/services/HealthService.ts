import type { ICacheService } from '@domain/cache/ICacheService'
import type { IAqiRepository } from '@domain/repositories/IAqiRepository'
import type { ICityRepository } from '@domain/repositories/ICityRepository'
import type { HealthDataRecord, IHealthRepository } from '@domain/repositories/IHealthRepository'

const TTL_24_HOURS = 60 * 60 * 24

function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n < 2) return 0

  const meanX = xs.slice(0, n).reduce((s, v) => s + v, 0) / n
  const meanY = ys.slice(0, n).reduce((s, v) => s + v, 0) / n

  let num = 0, denX = 0, denY = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - meanX
    const dy = ys[i]! - meanY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }

  const denom = Math.sqrt(denX * denY)
  return denom === 0 ? 0 : Math.round((num / denom) * 100) / 100
}

export interface HealthResult {
  cityId: string
  populationTotal: number | null
  elderlyPct: number | null
  childrenPct: number | null
  /** Latest `HealthData.source` for this city (e.g. `datasus-sih`). */
  dataSource: string | null
  monthlyData: Array<{
    year: number
    month: number
    hospitalizations: number
    avgAqi: number | null
  }>
  correlation: number
  totalHospitalizations: number
}

export class HealthService {
  constructor(
    private readonly healthRepository: IHealthRepository,
    private readonly aqiRepository: IAqiRepository,
    private readonly cityRepository: ICityRepository,
    private readonly cache: ICacheService,
  ) {}

  async getHealthData(cityId: string): Promise<HealthResult> {
    const key = `health:${cityId}`
    const cached = this.cache.get<HealthResult>(key)
    if (cached) return cached

    const [city, healthRecords, aqiHistory, dataSource] = await Promise.all([
      this.cityRepository.findById(cityId),
      this.healthRepository.findByCity(cityId, 12),
      this.aqiRepository.findHistoryByCity(cityId, '1y'),
      this.healthRepository.findLatestSource(cityId),
    ])

    const monthlyAqi = new Map<string, number[]>()
    for (const r of aqiHistory) {
      const key = `${r.timestamp.getFullYear()}-${r.timestamp.getMonth() + 1}`
      const arr = monthlyAqi.get(key) ?? []
      arr.push(r.aqi)
      monthlyAqi.set(key, arr)
    }

    const monthlyData = healthRecords.map((r: HealthDataRecord) => {
      const aqiArr = monthlyAqi.get(`${r.year}-${r.month}`) ?? []
      const avgAqi = aqiArr.length
        ? Math.round(aqiArr.reduce((s, v) => s + v, 0) / aqiArr.length)
        : null
      return {
        year: r.year,
        month: r.month,
        hospitalizations: r.respiratoryHospitalizations,
        avgAqi,
      }
    })

    const paired = monthlyData.filter(d => d.avgAqi != null)
    const correlation = pearsonCorrelation(
      paired.map(d => d.avgAqi!),
      paired.map(d => d.hospitalizations),
    )

    const result: HealthResult = {
      cityId,
      populationTotal: city?.populationTotal ?? null,
      elderlyPct: city?.elderlyPct ?? null,
      childrenPct: city?.childrenPct ?? null,
      dataSource,
      monthlyData,
      correlation,
      totalHospitalizations: healthRecords.reduce(
        (s, r) => s + r.respiratoryHospitalizations, 0,
      ),
    }

    this.cache.set(key, result, TTL_24_HOURS)
    return result
  }
}
