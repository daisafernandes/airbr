import type { IAqiRepository } from '@domain/repositories/IAqiRepository'
import type { IFireRepository } from '@domain/repositories/IFireRepository'
import { prisma } from '@infrastructure/database/prisma'
import { withRetry } from '@shared/utils/retry'
import type { ICollector } from './collectors/ICollector'

const MAX_ATTEMPTS = 3
const RETRY_BASE_DELAY_MS = 1_000

/**
 * Orchestrates collectors and persists normalized readings to the database.
 *
 * Each collector run follows this lifecycle:
 *   1. Create a JobLog with status=RUNNING
 *   2. Call collector.collect() with up to MAX_ATTEMPTS retries (exponential backoff)
 *   3. Persist normalised readings
 *   4. Update the JobLog to SUCCESS or ERROR
 *
 * AQI collectors produce city-linked readings; fire collectors produce geographic foci.
 */
export class Normalizer {
  constructor(
    private readonly aqiCollectors: ICollector[],
    private readonly fireCollectors: ICollector[],
    private readonly aqiRepository: IAqiRepository,
    private readonly fireRepository: IFireRepository,
  ) {}

  async runAqi(): Promise<void> {
    for (const collector of this.aqiCollectors) {
      await this.runWithLog(collector, async () => {
        const readings = await withRetry(() => collector.collect(), MAX_ATTEMPTS, RETRY_BASE_DELAY_MS)
        let count = 0

        for (const reading of readings) {
          if (!reading.cityId || reading.aqi == null) continue

          await this.aqiRepository.upsert({
            cityId: reading.cityId,
            aqi: reading.aqi,
            pm25: reading.pm25 ?? null,
            pm10: reading.pm10 ?? null,
            o3: reading.o3 ?? null,
            no2: reading.no2 ?? null,
            co: reading.co ?? null,
            uv: reading.uv ?? null,
            pollen: reading.pollen ?? null,
            timestamp: reading.timestamp,
            source: reading.source,
          })

          count++
        }

        console.info(`[Normalizer] ${collector.name}: inserted ${count} AQI readings`)
        return count
      })
    }
  }

  async runFire(): Promise<void> {
    for (const collector of this.fireCollectors) {
      await this.runWithLog(collector, async () => {
        const readings = await withRetry(() => collector.collect(), MAX_ATTEMPTS, RETRY_BASE_DELAY_MS)
        let count = 0

        for (const reading of readings) {
          await this.fireRepository.upsert({
            lat: reading.lat,
            lng: reading.lng,
            intensity: reading.intensity ?? null,
            satellite: reading.satellite ?? null,
            biome: reading.biome ?? null,
            state: reading.state ?? null,
            detectedAt: reading.timestamp,
          })

          count++
        }

        console.info(`[Normalizer] ${collector.name}: inserted ${count} fire foci`)
        return count
      })
    }
  }

  /**
   * Creates a RUNNING JobLog, executes `work`, then updates the log to SUCCESS or ERROR.
   * The `work` callback returns the number of records inserted.
   */
  private async runWithLog(
    collector: ICollector,
    work: () => Promise<number>,
  ): Promise<void> {
    const startedAt = new Date()
    const start = Date.now()

    const log = await prisma.jobLog.create({
      data: {
        collectorName: collector.name,
        status: 'RUNNING',
        startedAt,
      },
    })

    let status: 'SUCCESS' | 'ERROR' = 'SUCCESS'
    let recordsInserted = 0
    let errorMessage: string | null = null

    try {
      recordsInserted = await work()
    } catch (err) {
      status = 'ERROR'
      errorMessage = err instanceof Error ? err.message : String(err)
      console.error(`[Normalizer] ${collector.name} failed after ${MAX_ATTEMPTS} attempts:`, errorMessage)
    }

    await prisma.jobLog.update({
      where: { id: log.id },
      data: {
        status,
        recordsInserted,
        errorMessage,
        durationMs: Date.now() - start,
      },
    })
  }
}
