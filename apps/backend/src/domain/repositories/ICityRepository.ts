export interface CityData {
  id: string
  name: string
  state: string
  region: string
  lat: number
  lng: number
  source: string
  createdAt: Date
}

export interface NearbyCity extends CityData {
  distanceKm: number
}

export interface ICityRepository {
  findAll(): Promise<CityData[]>
  findById(id: string): Promise<CityData | null>
  findByName(name: string): Promise<CityData[]>
  findNearby(lat: number, lng: number, radiusKm: number): Promise<NearbyCity[]>
}
