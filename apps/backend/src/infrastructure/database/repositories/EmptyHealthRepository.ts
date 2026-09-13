import type {
  HealthDataRecord,
  HealthDataUpsertInput,
  IHealthRepository,
} from '@domain/repositories/IHealthRepository'

/** No persisted public-health history; health endpoints degrade to empty series. */
export class EmptyHealthRepository implements IHealthRepository {
  async upsert(input: HealthDataUpsertInput): Promise<HealthDataRecord> {
    return {
      id: 'noop',
      cityId: input.cityId,
      year: input.year,
      month: input.month,
      respiratoryHospitalizations: input.respiratoryHospitalizations,
      source: input.source ?? 'none',
      createdAt: new Date(),
    }
  }

  async findByCity(_cityId: string, _months?: number): Promise<HealthDataRecord[]> {
    return []
  }

  async findLatestSource(_cityId: string): Promise<string | null> {
    return null
  }
}
