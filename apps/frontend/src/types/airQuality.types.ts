export interface CityApiData {
  id: string
  name: string
  state: string
  region: string
  lat: number
  lng: number
  source: string
  createdAt: string
  latestAqi: AqiReadingApi | null
}

export interface AqiReadingApi {
  id: string
  cityId: string
  aqi: number
  pm25: number | null
  pm10: number | null
  o3: number | null
  no2: number | null
  co: number | null
  uv: number | null
  pollen: number | null
  timestamp: string
  source: string
}

export interface FireFocusApi {
  id: string
  lat: number
  lng: number
  intensity: number | null
  satellite: string | null
  biome: string | null
  state: string | null
  detectedAt: string
}

export interface RankedCityApi {
  cityId: string
  cityName: string
  state: string
  region: string
  aqi: number
}

export interface RankingResponse {
  mostPolluted: RankedCityApi[]
  leastPolluted: RankedCityApi[]
}

export interface NearbyCityApi extends CityApiData {
  distanceKm: number
}

export type HistoryPeriod = '24h' | '7d' | '30d' | '1y'

export interface FireFilters {
  state?: string
  biome?: string
}

export interface RankingFilters {
  region?: string
  state?: string
}
