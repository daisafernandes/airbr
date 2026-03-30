import { prisma } from '../prisma'
import type { IMunicipalityRepository, NearestMunicipality } from '@domain/repositories/IMunicipalityRepository'

const EARTH_RADIUS_KM = 6371

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

type MunRow = { name: string; state: string; lat: number; lng: number }

export class PrismaMunicipalityRepository implements IMunicipalityRepository {
  private memoryCache: MunRow[] | null = null

  async findNearest(lat: number, lng: number): Promise<NearestMunicipality | null> {
    const batch = await this.findNearestBatch([{ lat, lng }])
    return batch[0] ?? null
  }

  async findNearestBatch(points: Array<{ lat: number; lng: number }>): Promise<Array<NearestMunicipality | null>> {
    if (points.length === 0) return []

    try {
      return await this.findNearestBatchPostgis(points)
    } catch {
      return this.findNearestBatchMemory(points)
    }
  }

  private async findNearestBatchPostgis(
    points: Array<{ lat: number; lng: number }>,
  ): Promise<Array<NearestMunicipality | null>> {
    const values = points
      .map((p, i) => `(${i}::int, ${Number(p.lat)}::float8, ${Number(p.lng)}::float8)`)
      .join(', ')

    type RawRow = { ord: number; name: string; state: string; distance_km: number }
    const rows = await prisma.$queryRawUnsafe<RawRow[]>(
      `
      WITH pts(ord, lat, lng) AS (VALUES ${values})
      SELECT
        pts.ord,
        m.name,
        m.state,
        CASE
          WHEN m.name IS NULL THEN NULL
          ELSE ST_Distance(
            ST_SetSRID(ST_MakePoint(m.lng, m.lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(pts.lng, pts.lat), 4326)::geography
          ) / 1000
        END AS distance_km
      FROM pts
      LEFT JOIN LATERAL (
        SELECT mu.name, mu.state, mu.lat, mu.lng
        FROM municipalities mu
        ORDER BY
          ST_SetSRID(ST_MakePoint(mu.lng, mu.lat), 4326)::geography
          <-> ST_SetSRID(ST_MakePoint(pts.lng, pts.lat), 4326)::geography
        LIMIT 1
      ) m ON true
      ORDER BY pts.ord
      `,
    )

    const out: Array<NearestMunicipality | null> = points.map(() => null)
    for (const r of rows) {
      if (r.name != null && r.distance_km != null) {
        out[r.ord] = {
          name: r.name,
          state: r.state,
          distanceKm: Number(r.distance_km),
        }
      }
    }
    return out
  }

  private async findNearestBatchMemory(
    points: Array<{ lat: number; lng: number }>,
  ): Promise<Array<NearestMunicipality | null>> {
    if (!this.memoryCache) {
      this.memoryCache = await prisma.municipality.findMany({
        select: { name: true, state: true, lat: true, lng: true },
      })
    }
    const rows = this.memoryCache
    if (rows.length === 0) return points.map(() => null)

    return points.map(pt => {
      let best: MunRow = rows[0]!
      let bestD = haversineKm(pt.lat, pt.lng, best.lat, best.lng)
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i]!
        const d = haversineKm(pt.lat, pt.lng, r.lat, r.lng)
        if (d < bestD) {
          bestD = d
          best = r
        }
      }
      return { name: best.name, state: best.state, distanceKm: bestD }
    })
  }
}
