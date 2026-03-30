import axios from 'axios'
import type { IDeforestationRepository } from '@domain/repositories/IDeforestationRepository'

/**
 * PRODES Collector — deforestation alerts from INPE TerraBrasilis.
 * API: https://terrabrasilis.dpi.inpe.br/geoserver/prodes-amazon-nb/ows (WFS GeoJSON)
 * No API key required. Updated daily.
 */
const TERRABRASILIS_WFS =
  'https://terrabrasilis.dpi.inpe.br/geoserver/prodes-amazon-nb/ows'

const STATE_CODES: Record<string, string> = {
  AM: 'AM', PA: 'PA', MT: 'MT', RO: 'RO', AC: 'AC',
  AP: 'AP', RR: 'RR', TO: 'TO', MA: 'MA',
}

interface ProdesFeature {
  type: string
  geometry?: {
    type: string
    coordinates?: unknown
  } | null
  properties: {
    state?: string
    uf?: string
    area_km?: number
    areakm2?: number
    /** Scene / detection date from PRODES (preferred for detectedAt) */
    image_date?: string
    view_date?: string
    publish_year?: string
    year?: number
    biome?: string
    classname?: string
    geometry_name?: string
  }
}

interface ProdesGeoJSON {
  type: string
  features?: ProdesFeature[]
  totalFeatures?: number
}

function ringCentroid(ring: number[][] | undefined): { lat: number; lng: number } | null {
  if (!ring?.length) return null
  let sumLng = 0
  let sumLat = 0
  let n = 0
  for (const pt of ring) {
    if (pt[0] == null || pt[1] == null) continue
    sumLng += pt[0]
    sumLat += pt[1]
    n++
  }
  if (!n) return null
  return { lng: sumLng / n, lat: sumLat / n }
}

/** Centroid for Point, Polygon, or MultiPolygon (WFS returns MultiPolygon for PRODES). */
function centroidFromGeometry(
  geometry: ProdesFeature['geometry'],
): { lat: number; lng: number } | null {
  if (!geometry?.coordinates) return null
  if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
    const coords = geometry.coordinates as number[]
    const lng = coords[0]
    const lat = coords[1]
    if (lng == null || lat == null) return null
    return { lng, lat }
  }
  if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
    const ring = (geometry.coordinates as number[][][])[0]
    return ringCentroid(ring)
  }
  if (geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates)) {
    const firstPoly = (geometry.coordinates as number[][][][])[0]
    const ring = firstPoly?.[0]
    return ringCentroid(ring)
  }
  return null
}

export class PRODESCollector {
  name = 'PRODESCollector'

  constructor(private readonly deforestationRepository: IDeforestationRepository) {}

  async collect(): Promise<number> {
    try {
      const currentYear = new Date().getFullYear()
      const yearsToTry = [currentYear, currentYear - 1, currentYear - 2]

      let data: ProdesGeoJSON | null = null
      for (const year of yearsToTry) {
        const { data: resp } = await axios.get<ProdesGeoJSON>(TERRABRASILIS_WFS, {
          params: {
            service: 'WFS',
            version: '2.0.0',
            request: 'GetFeature',
            typeName: 'prodes-amazon-nb:yearly_deforestation_biome',
            outputFormat: 'application/json',
            CQL_FILTER: `year=${year}`,
            count: 1000,
          },
          timeout: 30_000,
        })
        if (resp.features?.length) {
          data = resp
          if (year !== currentYear) {
            console.info(`[PRODES] Using year=${year} (no published data for ${currentYear} yet)`)
          }
          break
        }
      }

      if (!data?.features?.length) {
        console.warn('[PRODES] No features returned from TerraBrasilis for recent years')
        return 0
      }

      let count = 0
      for (const feature of data.features) {
        const p = feature.properties
        const state = p.state ?? p.uf ?? ''
        const areaHa = (p.area_km ?? p.areakm2 ?? 0) * 100
        const dateStr =
          p.image_date ??
          p.view_date ??
          (typeof p.publish_year === 'string' ? p.publish_year.slice(0, 10) : undefined) ??
          `${p.year ?? currentYear}-01-01`
        const detectedAt = new Date(dateStr)

        if (!state || areaHa <= 0) continue

        const centroid = centroidFromGeometry(feature.geometry)
        const lat = centroid?.lat ?? null
        const lng = centroid?.lng ?? null
        if (lat == null || lng == null) continue

        await this.deforestationRepository.upsert({
          state: STATE_CODES[state] ?? state,
          lat,
          lng,
          areaHa,
          biome: p.biome ?? null,
          detectedAt,
          source: 'prodes',
        })
        count++
      }

      console.info(`[PRODES] Inserted/updated ${count} deforestation alerts`)
      return count
    } catch (err) {
      console.error('[PRODES] Collection failed:', err instanceof Error ? err.message : err)
      return 0
    }
  }
}
