export interface FireFocusData {
  id: string
  lat: number
  lng: number
  intensity: number | null
  satellite: string | null
  biome: string | null
  state: string | null
  detectedAt: Date
}

export interface FireUpsertInput {
  lat: number
  lng: number
  intensity?: number | null
  satellite?: string | null
  biome?: string | null
  state?: string | null
  detectedAt: Date
}

export interface IFireRepository {
  findById(id: string): Promise<FireFocusData | null>
  findActive(sinceHours?: number): Promise<FireFocusData[]>
  findByState(state: string, sinceHours?: number): Promise<FireFocusData[]>
  findByBiome(biome: string, sinceHours?: number): Promise<FireFocusData[]>
  upsert(input: FireUpsertInput): Promise<FireFocusData>
}
