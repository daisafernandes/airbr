import nodemailer from 'nodemailer'
import { Resend } from 'resend'

import { env } from '@infrastructure/config/env'
import { logger } from '@shared/utils/logger'

/**
 * Sends transactional email via Resend when RESEND_API_KEY is set,
 * otherwise SMTP when SMTP_* is configured. Skips with structured logs if misconfigured.
 */
export class TransactionalEmailSender {
  async send(to: string, subject: string, text: string): Promise<void> {
    const from = env.EMAIL_FROM
    if (!from) {
      logger.warn('email.send_skipped', {
        reason: 'missing_email_from',
        ...(env.NODE_ENV === 'development' && { subject }),
      })
      return
    }

    if (env.RESEND_API_KEY) {
      const resend = new Resend(env.RESEND_API_KEY)
      const { error } = await resend.emails.send({
        from,
        to: [to],
        subject,
        text,
      })
      if (error) {
        logger.error('email.resend_failed', { err: String(error) })
        await this.trySmtpFallback(to, subject, text, from, { afterResendError: true })
      }
      return
    }

    await this.trySmtpFallback(to, subject, text, from)
  }

  private async trySmtpFallback(
    to: string,
    subject: string,
    text: string,
    from: string,
    opts?: { afterResendError?: boolean },
  ): Promise<void> {
    if (!env.SMTP_HOST || !env.SMTP_PORT) {
      logger.warn('email.send_skipped', {
        reason: 'smtp_not_configured',
        afterResendError: Boolean(opts?.afterResendError),
        subject: env.NODE_ENV === 'development' ? subject : undefined,
      })
      return
    }

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS,
            }
          : undefined,
    })

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
    })
  }
}
