export type JobStatus = 'RUNNING' | 'SUCCESS' | 'ERROR'

export interface JobLogEntry {
  id: string
  collectorName: string
  status: JobStatus
  recordsInserted: number | null
  errorMessage: string | null
  durationMs: number | null
  startedAt: Date
}

export interface IJobLogRepository {
  findRecent(limit: number): Promise<JobLogEntry[]>
}
