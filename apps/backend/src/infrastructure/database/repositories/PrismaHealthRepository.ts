import { prisma } from '../prisma'
import type {
  HealthDataRecord,
  HealthDataUpsertInput,
  IHealthRepository,
} from '@domain/repositories/IHealthRepository'

export class PrismaHealthRepository implements IHealthRepository {
  async upsert(input: HealthDataUpsertInput): Promise<HealthDataRecord> {
    return prisma.healthData.upsert({
      where: {
        cityId_year_month: {
          cityId: input.cityId,
          year: input.year,
          month: input.month,
        },
      },
      update: {
        respiratoryHospitalizations: input.respiratoryHospitalizations,
        source: input.source ?? 'datasus',
      },
      create: {
        cityId: input.cityId,
        year: input.year,
        month: input.month,
        respiratoryHospitalizations: input.respiratoryHospitalizations,
        source: input.source ?? 'datasus',
      },
    })
  }

  async findByCity(cityId: string, months = 12): Promise<HealthDataRecord[]> {
    const now = new Date()
    const since = new Date(now.getFullYear(), now.getMonth() - months, 1)

    return prisma.healthData.findMany({
      where: {
        cityId,
        OR: [
          { year: { gt: since.getFullYear() } },
          {
            year: since.getFullYear(),
            month: { gte: since.getMonth() + 1 },
          },
        ],
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    })
  }

  async findLatestSource(cityId: string): Promise<string | null> {
    const row = await prisma.healthData.findFirst({
      where: { cityId },
      orderBy: { createdAt: 'desc' },
      select: { source: true },
    })
    return row?.source ?? null
  }
}
