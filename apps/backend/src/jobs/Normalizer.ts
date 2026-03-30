import type { ICacheService } from '@domain/cache/ICacheService'
import type { IAqiRepository } from '@domain/repositories/IAqiRepository'
import type { IFireRepository } from '@domain/repositories/IFireRepository'
import { prisma } from '@infrastructure/database/prisma'
import { withRetry } from '@shared/utils/retry'
import type { DATASUSCollector } from './collectors/DATASUSCollector'
import type { IBGECollector } from './collectors/IBGECollector'
import type { ICollector } from './collectors/ICollector'
import type { PRODESCollector } from './collectors/PRODESCollector'

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
 *   5. On SUCCESS, invalidate related cache prefixes
 *
 * AQI collectors produce city-linked readings; fire collectors produce geographic foci.
 * Specialized collectors (PRODES, DATASUS, IBGE) manage their own persistence.
 */
export class Normalizer {
  constructor(
    private readonly aqiCollectors: ICollector[],
    private readonly fireCollectors: ICollector[],
    private readonly aqiRepository: IAqiRepository,
    private readonly fireRepository: IFireRepository,
    private readonly cache: ICacheService,
    private readonly prodesCollector?: PRODESCollector,
    private readonly datasusCollector?: DATASUSCollector,
    private readonly ibgeCollector?: IBGECollector,
  ) {}

  async runAqi(): Promise<void> {
    for (const collector of this.aqiCollectors) {
      await this.runWithLog(collector, 'cities:', async () => {
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
            windDirection: reading.windDirection ?? null,
            windSpeed: reading.windSpeed ?? null,
            temperature: reading.temperature ?? null,
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
      await this.runWithLog(collector, 'fires:', async () => {
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

  async runProdes(): Promise<void> {
    if (!this.prodesCollector) return
    await this.runSpecialized(this.prodesCollector.name, 'deforestation:', () =>
      this.prodesCollector!.collect(),
    )
  }

  async runDatasus(): Promise<void> {
    if (!this.datasusCollector) return
    await this.runSpecialized(this.datasusCollector.name, 'health:', () =>
      this.datasusCollector!.collect(),
    )
  }

  async runIbge(): Promise<void> {
    if (!this.ibgeCollector) return
    await this.runSpecialized(this.ibgeCollector.name, 'cities:', () =>
      this.ibgeCollector!.collect(),
    )
  }

  /** Runs all five collectors in sequence (AQI → fire → PRODES → DATASUS → IBGE). */
  async runAllCollections(): Promise<void> {
    await this.runAqi()
    await this.runFire()
    await this.runProdes()
    await this.runDatasus()
    await this.runIbge()
  }

  private async runSpecialized(
    collectorName: string,
    cachePrefix: string,
    work: () => Promise<number>,
  ): Promise<void> {
    await this.runWithLog({ name: collectorName } as ICollector, cachePrefix, work)
  }

  /**
   * Creates a RUNNING JobLog, executes `work`, then updates the log to SUCCESS or ERROR.
   * On SUCCESS, invalidates the given cache prefix so stale data is not served.
   * The `work` callback returns the number of records inserted.
   */
  private async runWithLog(
    collector: ICollector,
    cachePrefix: string,
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
      this.cache.invalidateByPrefix(cachePrefix)
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
