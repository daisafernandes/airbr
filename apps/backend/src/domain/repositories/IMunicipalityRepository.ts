export interface NearestMunicipality {
  name: string
  state: string
  distanceKm: number
}

export interface IMunicipalityRepository {
  findNearest(lat: number, lng: number): Promise<NearestMunicipality | null>
  /** Same order as input points; up to 3 nearest municipalities per point, by distance. */
  findNearestBatch(points: Array<{ lat: number; lng: number }>): Promise<NearestMunicipality[][]>
}
