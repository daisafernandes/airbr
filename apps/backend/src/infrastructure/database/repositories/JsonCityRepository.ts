import * as fs from 'node:fs'
import * as path from 'node:path'

import type { CityData, ICityRepository, NearbyCity } from '@domain/repositories/ICityRepository'
import { citySlug, foldAscii, haversineKm } from '@shared/utils/geo'

type CityJsonRow = {
  name: string
  state: string
  region: string
  lat: number
  lng: number
}

function defaultCitiesPath(): string {
  return path.join(__dirname, '..', '..', '..', '..', 'data', 'cities.json')
}

function loadCities(filePath: string): CityData[] {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as CityJsonRow[]
  const createdAt = new Date(0)

  return raw
    .map(row => ({
      id: citySlug(row.name, row.state),
      name: row.name,
      state: row.state,
      region: row.region,
      lat: row.lat,
      lng: row.lng,
      source: 'json',
      populationTotal: null,
      elderlyPct: null,
      childrenPct: null,
      createdAt,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

export class JsonCityRepository implements ICityRepository {
  private readonly cities: CityData[]
  private readonly byId: Map<string, CityData>

  constructor(citiesJsonPath: string = defaultCitiesPath()) {
    this.cities = loadCities(citiesJsonPath)
    this.byId = new Map(this.cities.map(c => [c.id, c]))
  }

  async findAll(): Promise<CityData[]> {
    return [...this.cities]
  }

  async findAllPaginated(params: { page: number; limit: number }): Promise<{ data: CityData[]; total: number }> {
    const total = this.cities.length
    const start = (params.page - 1) * params.limit
    const data = this.cities.slice(start, start + params.limit)
    return { data, total }
  }

  async findById(id: string): Promise<CityData | null> {
    return this.byId.get(id) ?? null
  }

  async findByName(name: string): Promise<CityData[]> {
    const q = foldAscii(name.trim())
    if (q.length === 0) return []

    return this.cities.filter(c => foldAscii(c.name).includes(q)).slice(0, 20)
  }

  async findNearby(lat: number, lng: number, radiusKm: number): Promise<NearbyCity[]> {
    const results: NearbyCity[] = []

    for (const city of this.cities) {
      const distanceKm = haversineKm(lat, lng, city.lat, city.lng)
      if (distanceKm <= radiusKm) {
        results.push({ ...city, distanceKm })
      }
    }

    results.sort((a, b) => a.distanceKm - b.distanceKm)
    return results
  }
}
