export interface DeforestationAlertData {
  id: string
  state: string
  lat: number | null
  lng: number | null
  areaHa: number
  biome: string | null
  detectedAt: Date
  source: string
  createdAt: Date
}

export interface DeforestationUpsertInput {
  state: string
  lat?: number | null
  lng?: number | null
  areaHa: number
  biome?: string | null
  detectedAt: Date
  source?: string
}

export interface DeforestationFilters {
  state?: string
  biome?: string
  since?: Date
}

export interface IDeforestationRepository {
  upsert(input: DeforestationUpsertInput): Promise<DeforestationAlertData>
  findAll(filters?: DeforestationFilters): Promise<DeforestationAlertData[]>
}
