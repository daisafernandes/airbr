import cron from 'node-cron'

import { prisma } from '@infrastructure/database/prisma'
import { productMetrics } from '@shared/metrics/productMetrics'
import { logger } from '@shared/utils/logger'

import type { AlertChecker } from './AlertChecker'
import type { Normalizer } from './Normalizer'

/**
 * Schedules all data-collection jobs using node-cron.
 * Rates are chosen to stay within free-tier API limits.
 */
export class JobScheduler {
  constructor(
    private readonly normalizer: Normalizer,
    private readonly alertChecker: AlertChecker,
  ) {}

  start(): void {
    // AQI (OWM + AQICN + OpenMeteo): every hour
    cron.schedule('0 * * * *', () => {
      productMetrics.incJobRun('aqiCollection')
      logger.info('scheduler.job_start', { job: 'aqi_collection' })
      void this.normalizer.runAqi()
    })

    // Fire foci (INPE): every 3 hours
    cron.schedule('0 */3 * * *', () => {
      productMetrics.incJobRun('fireCollection')
      logger.info('scheduler.job_start', { job: 'fire_collection' })
      void this.normalizer.runFire()
    })

    // PRODES deforestation: daily at 06:00
    cron.schedule('0 6 * * *', () => {
      logger.info('scheduler.job_start', { job: 'prodes' })
      void this.normalizer.runProdes()
    })

    // DATASUS health data: weekly on Sunday at 04:00
    cron.schedule('0 4 * * 0', () => {
      logger.info('scheduler.job_start', { job: 'datasus' })
      void this.normalizer.runDatasus()
    })

    // IBGE population: monthly on 1st at 05:00
    cron.schedule('0 5 1 * *', () => {
      logger.info('scheduler.job_start', { job: 'ibge' })
      void this.normalizer.runIbge()
    })

    // Cleanup AQI readings older than 90 days: daily at 03:00
    cron.schedule('0 3 * * *', () => {
      logger.info('scheduler.job_start', { job: 'cleanup_old_readings' })
      void this.cleanOldReadings()
    })

    // User AQI alerts (email / push): every 15 minutes
    cron.schedule('*/15 * * * *', () => {
      logger.info('scheduler.job_start', { job: 'alert_checker' })
      void this.alertChecker.run().catch((err) => {
        productMetrics.incJobError('alertChecker')
        logger.error('scheduler.alert_checker_failed', { err: String(err) })
      })
    })

    logger.info('scheduler.ready', {
      jobs: 'AQI=1h, Fire=3h, PRODES=24h, DATASUS=weekly, IBGE=monthly, Cleanup=24h, Alerts=15m',
    })
  }

  private async cleanOldReadings(): Promise<void> {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1_000)

    const { count } = await prisma.aqiReading.deleteMany({
      where: { timestamp: { lt: cutoff } },
    })

    logger.info('scheduler.cleanup_old_readings', { deletedCount: count })
  }
}
