import type { FireFocusData, FireUpsertInput, IFireRepository } from '@domain/repositories/IFireRepository'

import { prisma } from '../prisma'

export class PrismaFireRepository implements IFireRepository {
  private getSince(sinceHours = 48): Date {
    return new Date(Date.now() - sinceHours * 60 * 60 * 1000)
  }

  private async findPaginated(where: {
    state?: string
    biome?: string
    detectedAt: { gte: Date }
  }, page: number, limit: number): Promise<{ data: FireFocusData[]; total: number }> {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      prisma.fireFocus.findMany({
        where,
        orderBy: { detectedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.fireFocus.count({ where }),
    ])
    return { data, total }
  }

  async findById(id: string): Promise<FireFocusData | null> {
    return prisma.fireFocus.findUnique({ where: { id } })
  }

  async findActive(sinceHours = 48): Promise<FireFocusData[]> {
    const since = this.getSince(sinceHours)
    return prisma.fireFocus.findMany({
      where: { detectedAt: { gte: since } },
      orderBy: { detectedAt: 'desc' },
    })
  }

  async findActivePaginated(params: {
    sinceHours?: number
    page: number
    limit: number
  }): Promise<{ data: FireFocusData[]; total: number }> {
    return this.findPaginated(
      { detectedAt: { gte: this.getSince(params.sinceHours) } },
      params.page,
      params.limit,
    )
  }

  async findByState(state: string, sinceHours = 48): Promise<FireFocusData[]> {
    const since = this.getSince(sinceHours)
    return prisma.fireFocus.findMany({
      where: { state, detectedAt: { gte: since } },
      orderBy: { detectedAt: 'desc' },
    })
  }

  async findByStatePaginated(params: {
    state: string
    sinceHours?: number
    page: number
    limit: number
  }): Promise<{ data: FireFocusData[]; total: number }> {
    return this.findPaginated(
      { state: params.state, detectedAt: { gte: this.getSince(params.sinceHours) } },
      params.page,
      params.limit,
    )
  }

  async findByBiome(biome: string, sinceHours = 48): Promise<FireFocusData[]> {
    const since = this.getSince(sinceHours)
    return prisma.fireFocus.findMany({
      where: { biome, detectedAt: { gte: since } },
      orderBy: { detectedAt: 'desc' },
    })
  }

  async findByBiomePaginated(params: {
    biome: string
    sinceHours?: number
    page: number
    limit: number
  }): Promise<{ data: FireFocusData[]; total: number }> {
    return this.findPaginated(
      { biome: params.biome, detectedAt: { gte: this.getSince(params.sinceHours) } },
      params.page,
      params.limit,
    )
  }

  /** Idempotent insert — skips duplicates identified by (lat, lng, detectedAt). */
  async upsert(input: FireUpsertInput): Promise<FireFocusData> {
    return prisma.fireFocus.upsert({
      where: {
        lat_lng_detectedAt: {
          lat: input.lat,
          lng: input.lng,
          detectedAt: input.detectedAt,
        },
      },
      update: {
        intensity: input.intensity ?? null,
        satellite: input.satellite ?? null,
        biome: input.biome ?? null,
        state: input.state ?? null,
      },
      create: {
        lat: input.lat,
        lng: input.lng,
        intensity: input.intensity ?? null,
        satellite: input.satellite ?? null,
        biome: input.biome ?? null,
        state: input.state ?? null,
        detectedAt: input.detectedAt,
      },
    })
  }
}
