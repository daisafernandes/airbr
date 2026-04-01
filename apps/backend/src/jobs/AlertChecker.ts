import type { IAlertRepository } from '@domain/repositories/IAlertRepository'
import type { IAqiRepository } from '@domain/repositories/IAqiRepository'
import type { IPushSubscriptionRepository } from '@domain/repositories/IPushSubscriptionRepository'
import { env } from '@infrastructure/config/env'
import { TransactionalEmailSender } from '@infrastructure/providers/TransactionalEmailSender'
import { WebPushSender } from '@infrastructure/providers/WebPushSender'

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

      const title = `Air quality alert: ${row.cityName} (${row.state})`
      const body = `AQI is ${reading.aqi}, at or above your threshold of ${row.thresholdAqi}.`

      if (row.channels.includes('EMAIL')) {
        try {
          await this.emailSender.send(row.userEmail, title, body)
          await this.alerts.recordDispatch(row.alertId, 'EMAIL', reading.aqi)
          // eslint-disable-next-line no-console -- job audit log
          console.info(`[AlertChecker] Email sent for alert ${row.alertId} (AQI ${reading.aqi})`)
        } catch (err) {
          console.error(`[AlertChecker] Email failed for alert ${row.alertId}`, err)
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
            // eslint-disable-next-line no-console -- job audit log
            console.info(`[AlertChecker] Push sent for alert ${row.alertId}`)
          } catch (err) {
            console.error(`[AlertChecker] Push failed for subscription ${sub.id}`, err)
          }
        }
        if (pushSent) {
          await this.alerts.recordDispatch(row.alertId, 'PUSH', reading.aqi)
        }
      }
    }
  }
}
