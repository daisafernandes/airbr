import { prisma } from '../prisma'
import type { CityData, ICityRepository, NearbyCity } from '@domain/repositories/ICityRepository'

export class PrismaCityRepository implements ICityRepository {
  async findAll(): Promise<CityData[]> {
    return prisma.city.findMany({ orderBy: { name: 'asc' } })
  }

  async findById(id: string): Promise<CityData | null> {
    return prisma.city.findUnique({ where: { id } })
  }

  async findByName(name: string): Promise<CityData[]> {
    return prisma.city.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
      orderBy: { name: 'asc' },
      take: 20,
    })
  }

  /**
   * Finds cities within radiusKm using the Haversine formula via raw SQL.
   * Neon (PostgreSQL serverless) does not support PostGIS — Haversine replaces geospatial queries.
   */
  async findNearby(lat: number, lng: number, radiusKm: number): Promise<NearbyCity[]> {
    const EARTH_RADIUS_KM = 6371

    type RawRow = CityData & { distance_km: number }

    const results = await prisma.$queryRaw<RawRow[]>`
      SELECT
        id,
        name,
        state,
        region,
        lat,
        lng,
        source,
        "createdAt",
        distance_km
      FROM (
        SELECT
          *,
          (
            ${EARTH_RADIUS_KM} * acos(
              LEAST(1.0,
                cos(radians(${lat})) * cos(radians(lat)) *
                cos(radians(lng) - radians(${lng})) +
                sin(radians(${lat})) * sin(radians(lat))
              )
            )
          ) AS distance_km
        FROM cities
      ) sub
      WHERE distance_km <= ${radiusKm}
      ORDER BY distance_km ASC
    `

    return results.map((r: CityData & { distance_km: number }) => ({
      id: r.id,
      name: r.name,
      state: r.state,
      region: r.region,
      lat: r.lat,
      lng: r.lng,
      source: r.source,
      createdAt: r.createdAt,
      distanceKm: Number(r.distance_km),
    }))
  }
}
