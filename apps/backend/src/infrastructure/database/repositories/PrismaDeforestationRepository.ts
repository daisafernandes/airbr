import { prisma } from '../prisma'
import type {
  DeforestationAlertData,
  DeforestationFilters,
  DeforestationUpsertInput,
  IDeforestationRepository,
} from '@domain/repositories/IDeforestationRepository'

export class PrismaDeforestationRepository implements IDeforestationRepository {
  async upsert(input: DeforestationUpsertInput): Promise<DeforestationAlertData> {
    return prisma.deforestationAlert.create({ data: input })
  }

  async findAll(filters?: DeforestationFilters): Promise<DeforestationAlertData[]> {
    const since = filters?.since ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    return prisma.deforestationAlert.findMany({
      where: {
        detectedAt: { gte: since },
        ...(filters?.state ? { state: filters.state } : {}),
        ...(filters?.biome ? { biome: filters.biome } : {}),
      },
      orderBy: { detectedAt: 'desc' },
    })
  }
}
