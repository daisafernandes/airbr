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
    view_date?: string
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

export class PRODESCollector {
  name = 'PRODESCollector'

  constructor(private readonly deforestationRepository: IDeforestationRepository) {}

  async collect(): Promise<number> {
    try {
      const currentYear = new Date().getFullYear()
      const { data } = await axios.get<ProdesGeoJSON>(TERRABRASILIS_WFS, {
        params: {
          service: 'WFS',
          version: '2.0.0',
          request: 'GetFeature',
          typeName: 'prodes-amazon-nb:yearly_deforestation_biome',
          outputFormat: 'application/json',
          CQL_FILTER: `year=${currentYear}`,
          count: 1000,
        },
        timeout: 30_000,
      })

      if (!data.features?.length) {
        console.warn('[PRODES] No features returned from TerraBrasilis')
        return 0
      }

      let count = 0
      for (const feature of data.features) {
        const p = feature.properties
        const state = p.state ?? p.uf ?? ''
        const areaHa = (p.area_km ?? p.areakm2 ?? 0) * 100
        const dateStr = p.view_date ?? `${p.year ?? currentYear}-01-01`
        const detectedAt = new Date(dateStr)

        if (!state || areaHa <= 0) continue

        let lat: number | null = null
        let lng: number | null = null
        if (feature.geometry?.type === 'Point' && Array.isArray(feature.geometry.coordinates)) {
          const coords = feature.geometry.coordinates as number[]
          lng = coords[0] ?? null
          lat = coords[1] ?? null
        } else if (
          feature.geometry?.type === 'Polygon' &&
          Array.isArray(feature.geometry.coordinates)
        ) {
          const ring = (feature.geometry.coordinates as number[][][])[0]
          if (ring?.length) {
            lng = ring.reduce((s, c) => s + (c[0] ?? 0), 0) / ring.length
            lat = ring.reduce((s, c) => s + (c[1] ?? 0), 0) / ring.length
          }
        }

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
