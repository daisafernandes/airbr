import { createHash } from 'node:crypto'

import axios from 'axios'

import type { DeforestationAlertData } from '@domain/repositories/IDeforestationRepository'

/**
 * PRODES deforestation polygons from INPE TerraBrasilis (WFS GeoJSON).
 * No API key. Updated daily.
 */
export const TERRABRASILIS_WFS =
  'https://terrabrasilis.dpi.inpe.br/geoserver/prodes-amazon-nb/ows'

const STATE_CODES: Record<string, string> = {
  AM: 'AM',
  PA: 'PA',
  MT: 'MT',
  RO: 'RO',
  AC: 'AC',
  AP: 'AP',
  RR: 'RR',
  TO: 'TO',
  MA: 'MA',
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
    image_date?: string
    view_date?: string
    publish_year?: string
    year?: number
    biome?: string
  }
}

interface ProdesGeoJSON {
  type: string
  features?: ProdesFeature[]
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

export function centroidFromGeometry(
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

function deforestationId(
  state: string,
  lat: number,
  lng: number,
  detectedAt: Date,
  areaHa: number,
): string {
  return createHash('sha256')
    .update(`${state}:${lat.toFixed(5)}:${lng.toFixed(5)}:${detectedAt.toISOString()}:${areaHa}`)
    .digest('hex')
    .slice(0, 24)
}

export function featuresToAlerts(features: ProdesFeature[], fallbackYear: number): DeforestationAlertData[] {
  const now = new Date()
  const alerts: DeforestationAlertData[] = []

  for (const feature of features) {
    const p = feature.properties
    const stateRaw = p.state ?? p.uf ?? ''
    const areaHa = (p.area_km ?? p.areakm2 ?? 0) * 100
    const dateStr =
      p.image_date ??
      p.view_date ??
      (typeof p.publish_year === 'string' ? p.publish_year.slice(0, 10) : undefined) ??
      `${p.year ?? fallbackYear}-01-01`
    const detectedAt = new Date(dateStr)

    if (!stateRaw || areaHa <= 0 || Number.isNaN(detectedAt.getTime())) continue

    const centroid = centroidFromGeometry(feature.geometry)
    const lat = centroid?.lat ?? null
    const lng = centroid?.lng ?? null
    if (lat == null || lng == null) continue

    const state = STATE_CODES[stateRaw] ?? stateRaw

    alerts.push({
      id: deforestationId(state, lat, lng, detectedAt, areaHa),
      state,
      lat,
      lng,
      areaHa,
      biome: p.biome ?? null,
      detectedAt,
      source: 'prodes',
      createdAt: now,
    })
  }

  return alerts
}

export async function fetchPRODESAlerts(): Promise<DeforestationAlertData[]> {
  const currentYear = new Date().getFullYear()
  const yearsToTry = [currentYear, currentYear - 1, currentYear - 2]

  for (const year of yearsToTry) {
    const { data } = await axios.get<ProdesGeoJSON>(TERRABRASILIS_WFS, {
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

    if (data.features?.length) {
      return featuresToAlerts(data.features, year)
    }
  }

  return []
}
