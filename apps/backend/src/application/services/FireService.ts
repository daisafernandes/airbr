import type { ICacheService } from '@domain/cache/ICacheService'
import type { FireFocusData, IFireRepository } from '@domain/repositories/IFireRepository'
import type { IMunicipalityRepository, NearestMunicipality } from '@domain/repositories/IMunicipalityRepository'
import { buildPaginatedResult, type PaginatedResult, sanitizePagination } from '@shared/utils/pagination'

const TTL_3_HOURS = 60 * 60 * 3

export type FireFocusWithNearest = FireFocusData & {
  nearestMunicipalities: NearestMunicipality[]
}

export class FireService {
  constructor(
    private readonly fireRepository: IFireRepository,
    private readonly cache: ICacheService,
    private readonly municipalityRepository: IMunicipalityRepository,
  ) {}

  async listFires(options?: { state?: string; biome?: string; days?: number }): Promise<FireFocusWithNearest[]> {
    const sinceHours = options?.days != null ? options.days * 24 : 48
    const key = `fires:${options?.state ?? 'all'}:${options?.biome ?? 'all'}:${sinceHours}`
    const cached = this.cache.get<FireFocusData[]>(key)

    let result: FireFocusData[]
    if (cached) result = cached
    else {
      if (options?.state) result = await this.fireRepository.findByState(options.state, sinceHours)
      else if (options?.biome) result = await this.fireRepository.findByBiome(options.biome, sinceHours)
      else result = await this.fireRepository.findActive(sinceHours)
      this.cache.set(key, result, TTL_3_HOURS)
    }

    const nearest = await this.municipalityRepository.findNearestBatch(result.map(r => ({ lat: r.lat, lng: r.lng })))
    return result.map((r, i) => ({
      ...r,
      nearestMunicipalities: nearest[i] ?? [],
    }))
  }

  async listFiresPaginated(options?: {
    state?: string
    biome?: string
    days?: number
    page?: number
    limit?: number
  }): Promise<PaginatedResult<FireFocusWithNearest>> {
    const sinceHours = options?.days != null ? options.days * 24 : 48
    const pagination = sanitizePagination(options)
    const key = `fires:${options?.state ?? 'all'}:${options?.biome ?? 'all'}:${sinceHours}:${pagination.page}:${pagination.limit}`
    const cached = this.cache.get<PaginatedResult<FireFocusWithNearest>>(key)
    if (cached) return cached

    const paged = options?.state
      ? await this.fireRepository.findByStatePaginated({
          state: options.state,
          sinceHours,
          page: pagination.page,
          limit: pagination.limit,
        })
      : options?.biome
        ? await this.fireRepository.findByBiomePaginated({
            biome: options.biome,
            sinceHours,
            page: pagination.page,
            limit: pagination.limit,
          })
        : await this.fireRepository.findActivePaginated({
            sinceHours,
            page: pagination.page,
            limit: pagination.limit,
          })

    const nearest = await this.municipalityRepository.findNearestBatch(
      paged.data.map((r) => ({ lat: r.lat, lng: r.lng })),
    )
    const data = paged.data.map((r, i) => ({
      ...r,
      nearestMunicipalities: nearest[i] ?? [],
    }))
    const result = buildPaginatedResult(data, paged.total, pagination)
    this.cache.set(key, result, TTL_3_HOURS)
    return result
  }

  async getFireById(id: string): Promise<FireFocusWithNearest | null> {
    const focus = await this.fireRepository.findById(id)
    if (!focus) return null
    const nearest = await this.municipalityRepository.findNearestBatch([{ lat: focus.lat, lng: focus.lng }])
    return {
      ...focus,
      nearestMunicipalities: nearest[0] ?? [],
    }
  }
}
