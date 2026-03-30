import type { ICacheService } from '@domain/cache/ICacheService'
import type { FireFocusData, IFireRepository } from '@domain/repositories/IFireRepository'
import type { IMunicipalityRepository, NearestMunicipality } from '@domain/repositories/IMunicipalityRepository'

const TTL_3_HOURS = 60 * 60 * 3

export type FireFocusWithNearest = FireFocusData & {
  nearestMunicipality: NearestMunicipality | null
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
      nearestMunicipality: nearest[i] ?? null,
    }))
  }
}
