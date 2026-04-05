import type { IAlertRepository } from '@domain/repositories/IAlertRepository'
import type { IAqiRepository } from '@domain/repositories/IAqiRepository'
import type { IPushSubscriptionRepository } from '@domain/repositories/IPushSubscriptionRepository'
import { env } from '@infrastructure/config/env'
import { TransactionalEmailSender } from '@infrastructure/providers/TransactionalEmailSender'
import { WebPushSender } from '@infrastructure/providers/WebPushSender'
import { productMetrics } from '@shared/metrics/productMetrics'
import { buildAqiAlertNotification } from '@shared/utils/alertNotificationCopy'
import { logger } from '@shared/utils/logger'

const COOLDOWN_MS = () => env.ALERT_COOLDOWN_HOURS * 60 * 60 * 1_000

/**
 * Periodically evaluates user alerts against the latest AQI per city and sends email/push when the threshold is exceeded.
 */
export class AlertChecker {
  constructor(
    private readonly alerts: IAlertRepository,
    private readonly aqi: IAqiRepository,
    private readonly pushSubs: IPushSubscriptionRepository,
    private readonly emailSender = new TransactionalEmailSender(),
    private readonly pushSender = new WebPushSender(),
  ) {}

  async run(): Promise<void> {
    productMetrics.incJobRun('alertChecker')
    const active = await this.alerts.findActiveForChecker()
    const now = Date.now()

    for (const row of active) {
      const reading = await this.aqi.findLatestByCity(row.cityId)
      if (!reading) {
        continue
      }

      if (reading.aqi < row.thresholdAqi) {
        continue
      }

      const lastAt = await this.alerts.lastDispatchAt(row.alertId)
      if (lastAt && now - lastAt.getTime() < COOLDOWN_MS()) {
        continue
      }

      const { title, body } = buildAqiAlertNotification({
        preferredLocale: row.preferredLocale,
        cityName: row.cityName,
        state: row.state,
        aqi: reading.aqi,
        thresholdAqi: row.thresholdAqi,
      })

      if (row.channels.includes('EMAIL')) {
        try {
          await this.emailSender.send(row.userEmail, title, body)
          await this.alerts.recordDispatch(row.alertId, 'EMAIL', reading.aqi)
          productMetrics.incAlertDispatch('EMAIL')
          logger.info('alert_checker.email_sent', { alertId: row.alertId, aqi: reading.aqi })
        } catch (err) {
          logger.error('alert_checker.email_failed', { alertId: row.alertId, err: String(err) })
        }
      }

      if (row.channels.includes('PUSH')) {
        const subs = await this.pushSubs.findByUserId(row.userId)
        const payload = JSON.stringify({ title, body, url: '/' })
        let pushSent = false
        for (const sub of subs) {
          try {
            await this.pushSender.send(
              { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
              payload,
            )
            pushSent = true
            logger.info('alert_checker.push_sent', { alertId: row.alertId, subscriptionId: sub.id })
          } catch (err) {
            logger.error('alert_checker.push_failed', { subscriptionId: sub.id, err: String(err) })
          }
        }
        if (pushSent) {
          await this.alerts.recordDispatch(row.alertId, 'PUSH', reading.aqi)
          productMetrics.incAlertDispatch('PUSH')
        }
      }
    }
  }
}
