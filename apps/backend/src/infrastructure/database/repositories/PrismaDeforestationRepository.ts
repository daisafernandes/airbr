import { prisma } from '../prisma'
import type {
  DeforestationAlertData,
  DeforestationFilters,
  DeforestationUpsertInput,
  IDeforestationRepository,
} from '@domain/repositories/IDeforestationRepository'

export class PrismaDeforestationRepository implements IDeforestationRepository {
  private getSince(filters?: DeforestationFilters): Date {
    // PRODES scenes span the monitoring year; 90d would hide most polygons. Default ~24 months.
    return filters?.since ?? new Date(Date.now() - 730 * 24 * 60 * 60 * 1000)
  }

  private buildWhere(filters?: DeforestationFilters) {
    return {
      detectedAt: { gte: this.getSince(filters) },
      ...(filters?.state ? { state: filters.state } : {}),
      ...(filters?.biome ? { biome: filters.biome } : {}),
    }
  }

  async upsert(input: DeforestationUpsertInput): Promise<DeforestationAlertData> {
    return prisma.deforestationAlert.create({ data: input })
  }

  async findAll(filters?: DeforestationFilters): Promise<DeforestationAlertData[]> {
    return prisma.deforestationAlert.findMany({
      where: this.buildWhere(filters),
      orderBy: { detectedAt: 'desc' },
    })
  }

  async findAllPaginated(params: {
    filters?: DeforestationFilters
    page: number
    limit: number
  }): Promise<{ data: DeforestationAlertData[]; total: number }> {
    const skip = (params.page - 1) * params.limit
    const where = this.buildWhere(params.filters)
    const [data, total] = await Promise.all([
      prisma.deforestationAlert.findMany({
        where,
        orderBy: { detectedAt: 'desc' },
        skip,
        take: params.limit,
      }),
      prisma.deforestationAlert.count({ where }),
    ])

    return { data, total }
  }
}
