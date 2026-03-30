import nodemailer from 'nodemailer'
import { Resend } from 'resend'

import { env } from '@infrastructure/config/env'

/**
 * Sends transactional email via Resend when RESEND_API_KEY is set,
 * otherwise SMTP when SMTP_* is configured. Logs a warning in development if neither is available.
 */
export class TransactionalEmailSender {
  async send(to: string, subject: string, text: string): Promise<void> {
    const from = env.EMAIL_FROM
    if (!from) {
      console.warn('[Email] EMAIL_FROM is not set; skipping send')
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
        console.error('[Email] Resend error:', error)
        await this.trySmtpFallback(to, subject, text, from)
      }
      return
    }

    await this.trySmtpFallback(to, subject, text, from)
  }

  private async trySmtpFallback(to: string, subject: string, text: string, from: string): Promise<void> {
    if (!env.SMTP_HOST || !env.SMTP_PORT) {
      if (env.NODE_ENV === 'development') {
        console.warn(`[Email] No Resend/SMTP; would send to ${to}: ${subject}`)
      }
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
