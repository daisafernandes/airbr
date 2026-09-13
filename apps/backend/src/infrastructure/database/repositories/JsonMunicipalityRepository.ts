import * as fs from 'node:fs'
import * as path from 'node:path'

import type { IMunicipalityRepository, NearestMunicipality } from '@domain/repositories/IMunicipalityRepository'
import { haversineKm } from '@shared/utils/geo'

type MunicipalityGeoRow = {
  ibgeCode: number
  name: string
  state: string
  region: string
  lat: number
  lng: number
}

type MunRow = { name: string; state: string; lat: number; lng: number }

const TOP_NEAREST = 3

function defaultMunicipalitiesPath(): string {
  return path.join(__dirname, '..', '..', '..', '..', 'data', 'municipalities-geo.json')
}

function loadMunicipalities(filePath: string): MunRow[] {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as MunicipalityGeoRow[]
  return raw.map(m => ({
    name: m.name,
    state: m.state,
    lat: m.lat,
    lng: m.lng,
  }))
}

export class JsonMunicipalityRepository implements IMunicipalityRepository {
  private readonly rows: MunRow[]

  constructor(municipalitiesJsonPath: string = defaultMunicipalitiesPath()) {
    this.rows = loadMunicipalities(municipalitiesJsonPath)
  }

  async findNearest(lat: number, lng: number): Promise<NearestMunicipality | null> {
    const batch = await this.findNearestBatch([{ lat, lng }])
    return batch[0]?.[0] ?? null
  }

  async findNearestBatch(points: Array<{ lat: number; lng: number }>): Promise<NearestMunicipality[][]> {
    if (points.length === 0) return []
    if (this.rows.length === 0) return points.map(() => [])

    return points.map(pt => {
      const scored = this.rows.map(r => ({
        name: r.name,
        state: r.state,
        distanceKm: haversineKm(pt.lat, pt.lng, r.lat, r.lng),
      }))
      scored.sort((a, b) => a.distanceKm - b.distanceKm)
      return scored.slice(0, TOP_NEAREST)
    })
  }
}
