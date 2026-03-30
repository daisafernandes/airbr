export interface NearestMunicipality {
  name: string
  state: string
  distanceKm: number
}

export interface IMunicipalityRepository {
  findNearest(lat: number, lng: number): Promise<NearestMunicipality | null>
  /** Same order as input points; null if table empty or lookup fails. */
  findNearestBatch(points: Array<{ lat: number; lng: number }>): Promise<Array<NearestMunicipality | null>>
}
