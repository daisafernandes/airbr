export interface CityData {
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
}

export interface NearbyCity extends CityData {
  distanceKm: number
}

export interface ICityRepository {
  findAll(): Promise<CityData[]>
  findAllPaginated(params: { page: number; limit: number }): Promise<{ data: CityData[]; total: number }>
  findById(id: string): Promise<CityData | null>
  findByName(name: string): Promise<CityData[]>
  findNearby(lat: number, lng: number, radiusKm: number): Promise<NearbyCity[]>
}
