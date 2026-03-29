export interface AqiReadingData {
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
  timestamp: Date
  source: string
}

export interface AqiUpsertInput {
  cityId: string
  aqi: number
  pm25?: number | null
  pm10?: number | null
  o3?: number | null
  no2?: number | null
  co?: number | null
  uv?: number | null
  pollen?: number | null
  timestamp: Date
  source: string
}

export interface RankedCity {
  cityId: string
  cityName: string
  state: string
  region: string
  aqi: number
}

export type HistoryPeriod = '24h' | '7d' | '30d' | '1y'

export interface IAqiRepository {
  findLatestByCity(cityId: string): Promise<AqiReadingData | null>
  findLatestForAllCities(): Promise<AqiReadingData[]>
  findHistoryByCity(cityId: string, period: HistoryPeriod): Promise<AqiReadingData[]>
  upsert(input: AqiUpsertInput): Promise<AqiReadingData>
  getRanking(options?: { region?: string; state?: string; limit?: number }): Promise<{ mostPolluted: RankedCity[]; leastPolluted: RankedCity[] }>
}
