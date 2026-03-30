import type { FireFocusData, FireUpsertInput, IFireRepository } from '@domain/repositories/IFireRepository'

import { prisma } from '../prisma'

export class PrismaFireRepository implements IFireRepository {
  async findActive(sinceHours = 48): Promise<FireFocusData[]> {
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000)
    return prisma.fireFocus.findMany({
      where: { detectedAt: { gte: since } },
      orderBy: { detectedAt: 'desc' },
    })
  }

  async findByState(state: string, sinceHours = 48): Promise<FireFocusData[]> {
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000)
    return prisma.fireFocus.findMany({
      where: { state, detectedAt: { gte: since } },
      orderBy: { detectedAt: 'desc' },
    })
  }

  async findByBiome(biome: string, sinceHours = 48): Promise<FireFocusData[]> {
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000)
    return prisma.fireFocus.findMany({
      where: { biome, detectedAt: { gte: since } },
      orderBy: { detectedAt: 'desc' },
    })
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
