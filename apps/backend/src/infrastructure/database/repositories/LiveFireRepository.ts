import type { ICacheService } from '@domain/cache/ICacheService'
import type {
  FireFocusData,
  FireUpsertInput,
  IFireRepository,
} from '@domain/repositories/IFireRepository'
import { fetchINPEFires, fireFocusId } from '@infrastructure/providers/inpeFiresClient'

/** INPE CSV is heavy; cache aggressively (updates ~every 3h). */
const TTL_1_HOUR = 60 * 60
const CACHE_ALL = 'live-fires:all'

export class LiveFireRepository implements IFireRepository {
  private inFlight: Promise<FireFocusData[]> | null = null

  constructor(private readonly cache: ICacheService) {}

  async findById(id: string): Promise<FireFocusData | null> {
    const all = await this.loadAll()
    return all.find((f) => f.id === id) ?? null
  }

  async findActive(sinceHours = 48): Promise<FireFocusData[]> {
    return this.filter(await this.loadAll(), { sinceHours })
  }

  async findActivePaginated(params: {
    sinceHours?: number
    page: number
    limit: number
  }): Promise<{ data: FireFocusData[]; total: number }> {
    return this.paginate(await this.filter(await this.loadAll(), { sinceHours: params.sinceHours }), params)
  }

  async findByState(state: string, sinceHours = 48): Promise<FireFocusData[]> {
    return this.filter(await this.loadAll(), { state, sinceHours })
  }

  async findByStatePaginated(params: {
    state: string
    sinceHours?: number
    page: number
    limit: number
  }): Promise<{ data: FireFocusData[]; total: number }> {
    return this.paginate(
      await this.filter(await this.loadAll(), { state: params.state, sinceHours: params.sinceHours }),
      params,
    )
  }

  async findByBiome(biome: string, sinceHours = 48): Promise<FireFocusData[]> {
    return this.filter(await this.loadAll(), { biome, sinceHours })
  }

  async findByBiomePaginated(params: {
    biome: string
    sinceHours?: number
    page: number
    limit: number
  }): Promise<{ data: FireFocusData[]; total: number }> {
    return this.paginate(
      await this.filter(await this.loadAll(), { biome: params.biome, sinceHours: params.sinceHours }),
      params,
    )
  }

  /** Read-only live source — no persistence. */
  async upsert(input: FireUpsertInput): Promise<FireFocusData> {
    return {
      id: fireFocusId(input.lat, input.lng, input.detectedAt),
      lat: input.lat,
      lng: input.lng,
      intensity: input.intensity ?? null,
      satellite: input.satellite ?? null,
      biome: input.biome ?? null,
      state: input.state ?? null,
      detectedAt: input.detectedAt,
    }
  }

  private async loadAll(): Promise<FireFocusData[]> {
    const cached = this.cache.get<FireFocusData[]>(CACHE_ALL)
    if (cached) return cached

    if (this.inFlight) return this.inFlight

    this.inFlight = fetchINPEFires()
      .then((fires) => {
        this.cache.set(CACHE_ALL, fires, TTL_1_HOUR)
        return fires
      })
      .catch((err) => {
        console.error('[LiveFire] INPE fetch failed:', err instanceof Error ? err.message : err)
        return [] as FireFocusData[]
      })
      .finally(() => {
        this.inFlight = null
      })

    return this.inFlight
  }

  private filter(
    fires: FireFocusData[],
    opts: { state?: string; biome?: string; sinceHours?: number },
  ): FireFocusData[] {
    const sinceHours = opts.sinceHours ?? 48
    const sinceMs = Date.now() - sinceHours * 60 * 60 * 1000

    return fires
      .filter((f) => {
        if (f.detectedAt.getTime() < sinceMs) return false
        if (opts.state && f.state !== opts.state) return false
        if (opts.biome && f.biome !== opts.biome) return false
        return true
      })
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
  }

  private paginate(
    fires: FireFocusData[],
    params: { page: number; limit: number },
  ): { data: FireFocusData[]; total: number } {
    const total = fires.length
    const start = (params.page - 1) * params.limit
    return { data: fires.slice(start, start + params.limit), total }
  }
}
