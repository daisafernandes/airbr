import type { ICacheService } from '@domain/cache/ICacheService'
import type {
  DeforestationAlertData,
  DeforestationFilters,
  IDeforestationRepository,
} from '@domain/repositories/IDeforestationRepository'

const TTL_6_HOURS = 60 * 60 * 6

export class DeforestationService {
  constructor(
    private readonly deforestationRepository: IDeforestationRepository,
    private readonly cache: ICacheService,
  ) {}

  async listAlerts(filters?: DeforestationFilters): Promise<DeforestationAlertData[]> {
    const key = `deforestation:${filters?.state ?? 'all'}:${filters?.biome ?? 'all'}:${filters?.since?.toISOString() ?? 'default'}`
    const cached = this.cache.get<DeforestationAlertData[]>(key)
    if (cached) return cached

    const result = await this.deforestationRepository.findAll(filters)
    this.cache.set(key, result, TTL_6_HOURS)
    return result
  }
}
