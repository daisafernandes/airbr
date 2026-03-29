export interface HealthDataRecord {
  id: string
  cityId: string
  year: number
  month: number
  respiratoryHospitalizations: number
  source: string
  createdAt: Date
}

export interface HealthDataUpsertInput {
  cityId: string
  year: number
  month: number
  respiratoryHospitalizations: number
  source?: string
}

export interface IHealthRepository {
  upsert(input: HealthDataUpsertInput): Promise<HealthDataRecord>
  findByCity(cityId: string, months?: number): Promise<HealthDataRecord[]>
}
