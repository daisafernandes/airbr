import type { ICacheService } from '@domain/cache/ICacheService'
import type {
  DeforestationAlertData,
  DeforestationFilters,
  IDeforestationRepository,
} from '@domain/repositories/IDeforestationRepository'
import { buildPaginatedResult, type PaginatedResult, sanitizePagination } from '@shared/utils/pagination'

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

  async listAlertsPaginated(params?: {
    filters?: DeforestationFilters
    page?: number
    limit?: number
  }): Promise<PaginatedResult<DeforestationAlertData>> {
    const pagination = sanitizePagination(params)
    const key = `deforestation:${params?.filters?.state ?? 'all'}:${params?.filters?.biome ?? 'all'}:${params?.filters?.since?.toISOString() ?? 'default'}:${pagination.page}:${pagination.limit}`
    const cached = this.cache.get<PaginatedResult<DeforestationAlertData>>(key)
    if (cached) return cached

    const paged = await this.deforestationRepository.findAllPaginated({
      filters: params?.filters,
      page: pagination.page,
      limit: pagination.limit,
    })
    const result = buildPaginatedResult(paged.data, paged.total, pagination)
    this.cache.set(key, result, TTL_6_HOURS)
    return result
  }
}
