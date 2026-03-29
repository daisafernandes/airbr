import { prisma } from '@infrastructure/database/prisma'
import type { IJobLogRepository, JobLogEntry } from '@domain/repositories/IJobLogRepository'

export class PrismaJobLogRepository implements IJobLogRepository {
  async findRecent(limit: number): Promise<JobLogEntry[]> {
    const rows = await prisma.jobLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: limit,
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
