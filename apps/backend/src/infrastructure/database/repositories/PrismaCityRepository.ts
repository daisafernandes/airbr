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
   * Finds cities within radiusKm using PostGIS ST_DWithin (geospatial index).
   * Falls back to Haversine formula if PostGIS is unavailable.
   */
  async findNearby(lat: number, lng: number, radiusKm: number): Promise<NearbyCity[]> {
    const radiusMeters = radiusKm * 1000

    type RawRow = {
      id: string
      name: string
      state: string
      region: string
      lat: number
      lng: number
      source: string
      populationTotal: number | null
      elderlyPct: number | null
      childrenPct: number | null
      createdAt: Date
      distance_km: number
    }

    try {
      const results = await prisma.$queryRaw<RawRow[]>`
        SELECT
          id,
          name,
          state,
          region,
          lat,
          lng,
          source,
          "populationTotal",
          "elderlyPct",
          "childrenPct",
          "createdAt",
          ST_Distance(
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) / 1000 AS distance_km
        FROM cities
        WHERE ST_DWithin(
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${radiusMeters}
        )
        ORDER BY distance_km ASC
      `

      return results.map(r => ({
        id: r.id,
        name: r.name,
        state: r.state,
        region: r.region,
        lat: Number(r.lat),
        lng: Number(r.lng),
        source: r.source,
        populationTotal: r.populationTotal,
        elderlyPct: r.elderlyPct,
        childrenPct: r.childrenPct,
        createdAt: r.createdAt,
        distanceKm: Number(r.distance_km),
      }))
    } catch {
      return this.findNearbyHaversine(lat, lng, radiusKm)
    }
  }

  private async findNearbyHaversine(lat: number, lng: number, radiusKm: number): Promise<NearbyCity[]> {
    const EARTH_RADIUS_KM = 6371

    type RawRow = {
      id: string; name: string; state: string; region: string;
      lat: number; lng: number; source: string;
      populationTotal: number | null; elderlyPct: number | null; childrenPct: number | null;
      createdAt: Date; distance_km: number
    }

    const results = await prisma.$queryRaw<RawRow[]>`
      SELECT
        id, name, state, region, lat, lng, source,
        "populationTotal", "elderlyPct", "childrenPct", "createdAt",
        distance_km
      FROM (
        SELECT *,
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

    return results.map(r => ({
      id: r.id, name: r.name, state: r.state, region: r.region,
      lat: Number(r.lat), lng: Number(r.lng), source: r.source,
      populationTotal: r.populationTotal, elderlyPct: r.elderlyPct, childrenPct: r.childrenPct,
      createdAt: r.createdAt, distanceKm: Number(r.distance_km),
    }))
  }
}
