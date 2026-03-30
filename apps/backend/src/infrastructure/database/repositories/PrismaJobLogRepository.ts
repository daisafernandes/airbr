import type { IJobLogRepository, JobLogEntry, JobStatus } from '@domain/repositories/IJobLogRepository'
import { prisma } from '@infrastructure/database/prisma'

export class PrismaJobLogRepository implements IJobLogRepository {
  async findRecent(limit: number, status?: JobStatus): Promise<JobLogEntry[]> {
    const rows = await prisma.jobLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: limit,
      where: { status },
    })

    return rows.map((row) => ({
      id: row.id,
      collectorName: row.collectorName,
      status: row.status as JobLogEntry['status'],
      recordsInserted: row.recordsInserted,
      errorMessage: row.errorMessage,
      durationMs: row.durationMs,
      startedAt: row.startedAt,
    }))
  }
}
