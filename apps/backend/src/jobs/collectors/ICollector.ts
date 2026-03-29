export interface NormalizedReading {
  /** DB city ID — present for AQI readings from city-based collectors */
  cityId?: string
  city?: string
  lat: number
  lng: number
  /** AQI value (0–500 scale). Null for fire-only readings. */
  aqi?: number | null
  pm25?: number | null
  pm10?: number | null
  o3?: number | null
  no2?: number | null
  co?: number | null
  uv?: number | null
  pollen?: number | null
  timestamp: Date
  source: string
  /** Fire-focus fields — only set by INPEFiresCollector */
  intensity?: number | null
  satellite?: string | null
  biome?: string | null
  state?: string | null
}

export interface ICollector {
  name: string
  collect(): Promise<NormalizedReading[]>
}
