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
  windDirection?: number | null
  windSpeed?: number | null
  temperature?: number | null
  timestamp: string
  source: string
}

export interface NearestMunicipalityApi {
  name: string
  state: string
  /** Distance from fire point to municipal seat (km). */
  distanceKm: number
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
  /** Up to 3 nearest IBGE municipalities (sede), by distance; from backend PostGIS when available. */
  nearestMunicipalities?: NearestMunicipalityApi[]
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
  days?: number
}

export interface RankingFilters {
  region?: string
  state?: string
}

// Phase 4 types

export interface WindSmokeApi {
  city: { id: string; lat: number; lng: number }
  wind: {
    direction: number | null
    speed: number | null
    compassLabel: string | null
  }
  nearbyFires: Array<{
    lat: number
    lng: number
    intensity: number | null
    biome: string | null
    distanceKm: number
  }>
}

export interface OutdoorSafetyApi {
  score: number
  level: 'seguro' | 'moderado' | 'arriscado'
  breakdown: {
    aqi: number | null
    uv: number | null
    pollen: number | null
    temperature: number | null
    aqiScore: number
    uvScore: number
    pollenScore: number
    tempScore: number
  }
}

export interface HealthMonthlyData {
  year: number
  month: number
  hospitalizations: number
  avgAqi: number | null
}

export interface HealthDataApi {
  cityId: string
  populationTotal: number | null
  elderlyPct: number | null
  childrenPct: number | null
  monthlyData: HealthMonthlyData[]
  correlation: number
  totalHospitalizations: number
}

export interface DeforestationAlertApi {
  id: string
  state: string
  lat: number | null
  lng: number | null
  areaHa: number
  biome: string | null
  detectedAt: string
  source: string
}

export interface DeforestationFilters {
  state?: string
  biome?: string
  since?: string
}

export interface OMSComplianceCityApi {
  cityId: string
  cityName: string
  state: string
  region: string
  pm25: number
  compliant: boolean
}

export interface OMSComplianceApi {
  cities: OMSComplianceCityApi[]
  compliantPct: number
}
