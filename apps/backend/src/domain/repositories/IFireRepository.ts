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
  findActivePaginated(params: {
    sinceHours?: number
    page: number
    limit: number
  }): Promise<{ data: FireFocusData[]; total: number }>
  findByState(state: string, sinceHours?: number): Promise<FireFocusData[]>
  findByStatePaginated(params: {
    state: string
    sinceHours?: number
    page: number
    limit: number
  }): Promise<{ data: FireFocusData[]; total: number }>
  findByBiome(biome: string, sinceHours?: number): Promise<FireFocusData[]>
  findByBiomePaginated(params: {
    biome: string
    sinceHours?: number
    page: number
    limit: number
  }): Promise<{ data: FireFocusData[]; total: number }>
  upsert(input: FireUpsertInput): Promise<FireFocusData>
}
