export interface Pollutant {
  key: 'pm25' | 'pm10' | 'co' | 'no2' | 'o3'
  label: string
  value: number
  unit: string
  whoLimit: number
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

export interface CityData {
  name: string
  state: string
  lat: number
  lng: number
  aqi: number
  aqiLabel: string
  pollutants: Pollutant[]
  history: AQIHistoryPoint[]
  forecast: DayForecast[]
  windDirection: number
  windSpeed: number
  nearbyFires: Array<{ lat: number; lng: number }>
  outdoorSafetyScore: number
  uvIndex: number
  pollenLevel: number
  healthAlerts: HealthAlert[]
  hospitalizations: number
  hospitalizationHistory: number[]
}
