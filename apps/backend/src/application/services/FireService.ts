import type { ICacheService } from '@domain/cache/ICacheService'
import type { FireFocusData, IFireRepository } from '@domain/repositories/IFireRepository'

const TTL_3_HOURS = 60 * 60 * 3

export class FireService {
  constructor(
    private readonly fireRepository: IFireRepository,
    private readonly cache: ICacheService,
  ) {}

  async listFires(options?: { state?: string; biome?: string }): Promise<FireFocusData[]> {
    const key = `fires:${options?.state ?? 'all'}:${options?.biome ?? 'all'}`
    const cached = this.cache.get<FireFocusData[]>(key)
    if (cached) return cached

    let result: FireFocusData[]
    if (options?.state) result = await this.fireRepository.findByState(options.state)
    else if (options?.biome) result = await this.fireRepository.findByBiome(options.biome)
    else result = await this.fireRepository.findActive()

    this.cache.set(key, result, TTL_3_HOURS)
    return result
  }
}
