import { createHash } from 'node:crypto'

import type { ICacheService } from '@domain/cache/ICacheService'
import type {
  DeforestationAlertData,
  DeforestationFilters,
  DeforestationUpsertInput,
  IDeforestationRepository,
} from '@domain/repositories/IDeforestationRepository'
import { fetchPRODESAlerts } from '@infrastructure/providers/prodesClient'

const TTL_1_HOUR = 60 * 60
const CACHE_ALL = 'live-deforestation:all'
/** PRODES scenes span the monitoring year; default window is about 24 months. */
const DEFAULT_SINCE_MS = 730 * 24 * 60 * 60 * 1000

export class LiveDeforestationRepository implements IDeforestationRepository {
  private inFlight: Promise<DeforestationAlertData[]> | null = null

  constructor(private readonly cache: ICacheService) {}

  /** Read-only live source — no persistence. */
  async upsert(input: DeforestationUpsertInput): Promise<DeforestationAlertData> {
    const lat = input.lat ?? 0
    const lng = input.lng ?? 0
    const id = createHash('sha256')
      .update(
        `${input.state}:${lat.toFixed(5)}:${lng.toFixed(5)}:${input.detectedAt.toISOString()}:${input.areaHa}`,
      )
      .digest('hex')
      .slice(0, 24)

    return {
      id,
      state: input.state,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      areaHa: input.areaHa,
      biome: input.biome ?? null,
      detectedAt: input.detectedAt,
      source: input.source ?? 'prodes',
      createdAt: new Date(),
    }
  }

  async findAll(filters?: DeforestationFilters): Promise<DeforestationAlertData[]> {
    return this.filter(await this.loadAll(), filters)
  }

  async findAllPaginated(params: {
    filters?: DeforestationFilters
    page: number
    limit: number
  }): Promise<{ data: DeforestationAlertData[]; total: number }> {
    const filtered = this.filter(await this.loadAll(), params.filters)
    const total = filtered.length
    const start = (params.page - 1) * params.limit
    return { data: filtered.slice(start, start + params.limit), total }
  }

  private async loadAll(): Promise<DeforestationAlertData[]> {
    const cached = this.cache.get<DeforestationAlertData[]>(CACHE_ALL)
    if (cached) return cached

    if (this.inFlight) return this.inFlight

    this.inFlight = fetchPRODESAlerts()
      .then((alerts) => {
        this.cache.set(CACHE_ALL, alerts, TTL_1_HOUR)
        return alerts
      })
      .catch((err) => {
        console.error('[LiveDeforestation] PRODES fetch failed:', err instanceof Error ? err.message : err)
        return [] as DeforestationAlertData[]
      })
      .finally(() => {
        this.inFlight = null
      })

    return this.inFlight
  }

  private filter(
    alerts: DeforestationAlertData[],
    filters?: DeforestationFilters,
  ): DeforestationAlertData[] {
    const since = filters?.since ?? new Date(Date.now() - DEFAULT_SINCE_MS)
    const sinceMs = since.getTime()

    return alerts
      .filter((a) => {
        if (a.detectedAt.getTime() < sinceMs) return false
        if (filters?.state && a.state !== filters.state) return false
        if (filters?.biome && a.biome !== filters.biome) return false
        return true
      })
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
  }
}
