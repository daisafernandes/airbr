export type Region = 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul'

export interface Pollutant {
  key: 'pm25' | 'pm10' | 'co' | 'no2' | 'o3'
  label: string
  value: number
  unit: string
  whoLimit: number
  description: string
}

export interface AQIHistoryPoint {
  day: string
  aqi: number
}

export type ForecastCondition = 'good' | 'moderate' | 'sensitive' | 'bad' | 'very-bad' | 'hazardous'
export type ForecastIcon = 'sun' | 'cloud-sun' | 'cloud' | 'haze' | 'storm'

export interface DayForecast {
  date: string
  aqi: number
  condition: ForecastCondition
  icon: ForecastIcon
}

export type AlertSeverity = 'info' | 'warning' | 'danger' | 'critical'

export interface HealthAlert {
  message: string
  severity: AlertSeverity
}

export interface FireSpot {
  lat: number
  lng: number
  intensity: 'low' | 'medium' | 'high'
}

export interface DeforestationArea {
  lat: number
  lng: number
  radius: number
}

export interface CityData {
  name: string
  state: string
  region: Region
  lat: number
  lng: number
  aqi: number
  aqiLabel: string
  pollutants: Pollutant[]
  history: AQIHistoryPoint[]
  history30d: AQIHistoryPoint[]
  forecast: DayForecast[]
  windDirection: number
  windSpeed: number
  nearbyFires: FireSpot[]
  deforestationAreas: DeforestationArea[]
  outdoorSafetyScore: number
  uvIndex: number
  pollenLevel: number
  healthAlerts: HealthAlert[]
  hospitalizations: number
  hospitalizationHistory: number[]
  omsCompliant: boolean
}
