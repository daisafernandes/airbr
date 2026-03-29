import cron from 'node-cron'

import { prisma } from '@infrastructure/database/prisma'
import type { Normalizer } from './Normalizer'

/**
 * Schedules all data-collection jobs using node-cron.
 * Rates are chosen to stay within free-tier API limits.
 */
export class JobScheduler {
  constructor(private readonly normalizer: Normalizer) {}

  start(): void {
    // AQI (OWM + AQICN + OpenMeteo): every hour
    cron.schedule('0 * * * *', () => {
      console.info('[Scheduler] Starting AQI collection')
      void this.normalizer.runAqi()
    })

    // Fire foci (INPE): every 3 hours
    cron.schedule('0 */3 * * *', () => {
      console.info('[Scheduler] Starting fire collection')
      void this.normalizer.runFire()
    })

    // Cleanup AQI readings older than 90 days: daily at 03:00
    cron.schedule('0 3 * * *', () => {
      console.info('[Scheduler] Starting old-readings cleanup')
      void this.cleanOldReadings()
    })

    console.info('[Scheduler] All jobs scheduled (AQI=1h, Fire=3h, Cleanup=24h)')
  }

  private async cleanOldReadings(): Promise<void> {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1_000)

    const { count } = await prisma.aqiReading.deleteMany({
      where: { timestamp: { lt: cutoff } },
    })

    console.info(`[Scheduler] Cleaned ${count} AQI readings older than 90 days`)
  }
}
