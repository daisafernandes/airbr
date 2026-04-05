import { z } from 'zod'

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3333),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    /** Base URL of the web app (password reset links, etc.). No trailing slash. */
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),
    DATABASE_URL: z
      .string()
      .url()
      .default('postgresql://postgres:postgres@localhost:5432/airbr'),
    /** Trimmed; empty after trim is treated as unset (avoids 401 from stray whitespace). */
    OWM_API_KEY: z.preprocess((v: unknown) => {
      if (v === undefined || v === null || v === '') return undefined
      if (typeof v === 'string') {
        const t = v.trim()
        return t === '' ? undefined : t
      }
      return v
    }, z.string().optional()),
    AQICN_TOKEN: z.string().optional(),
    CETESB_USERNAME: z.string().optional(),
    CETESB_PASSWORD: z.string().optional(),
    IEMA_API_KEY: z.string().optional(),
    IAT_API_KEY: z.string().optional(),
    /** Required when NODE_ENV is production; optional in development (admin routes open without key). */
    ADMIN_API_KEY: z.string().min(1).optional(),
    /** HS256 secret for user JWTs. Required in production. */
    JWT_SECRET: z.string().min(32).optional(),
    JWT_EXPIRES_IN: z.string().default('7d'),
    RESEND_API_KEY: z.string().optional(),
    /** Sender address for transactional email (Resend / SMTP). */
    EMAIL_FROM: z.string().email().optional(),
    SMTP_HOST: z.string().optional(),
    /** Omitted or empty in env parses as undefined (avoids z.coerce turning "" into 0). */
    SMTP_PORT: z.preprocess((val: unknown) => {
      if (val === undefined || val === null || val === '') return undefined
      if (typeof val === 'string' && val.trim() === '') return undefined
      return val
    }, z.coerce.number().min(1).max(65535).optional()),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    /** Web Push (VAPID). Required to send push notifications. */
    VAPID_PUBLIC_KEY: z.string().optional(),
    VAPID_PRIVATE_KEY: z.string().optional(),
    VAPID_SUBJECT: z.string().default('mailto:alerts@airbr.local'),
    /** Minimum hours between repeat notifications for the same alert (cooldown). */
    ALERT_COOLDOWN_HOURS: z.coerce.number().min(1).default(6),
    /**
     * When false (default), DATASUSCollector does not write population-based SIH estimates
     * if the public DATASUS HTTP API fails — avoids fake “real” demo data.
     * Set true only for local/dev when you accept synthetic health numbers.
     */
    DATASUS_ALLOW_POPULATION_ESTIMATE: z.preprocess(
      (v: unknown) => v === 'true' || v === '1',
      z.boolean(),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production' && !data.ADMIN_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ADMIN_API_KEY is required when NODE_ENV is production',
        path: ['ADMIN_API_KEY'],
      })
    }
    if (data.NODE_ENV === 'production' && !data.JWT_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'JWT_SECRET is required when NODE_ENV is production',
        path: ['JWT_SECRET'],
      })
    }

    const hasSmtpHost = Boolean(data.SMTP_HOST?.trim())
    const hasSmtpPort = data.SMTP_PORT !== undefined && data.SMTP_PORT !== null
    if (hasSmtpHost && !hasSmtpPort) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'SMTP_PORT is required when SMTP_HOST is set',
        path: ['SMTP_PORT'],
      })
    }
    if (!hasSmtpHost && hasSmtpPort) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'SMTP_HOST is required when SMTP_PORT is set',
        path: ['SMTP_HOST'],
      })
    }

    const hasResend = Boolean(data.RESEND_API_KEY?.trim())
    const smtpComplete = hasSmtpHost && hasSmtpPort
    const emailTransportConfigured = hasResend || smtpComplete
    if (data.NODE_ENV === 'production' && emailTransportConfigured && !data.EMAIL_FROM) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'EMAIL_FROM is required in production when RESEND_API_KEY or SMTP (host and port) is configured',
        path: ['EMAIL_FROM'],
      })
    }
  })

export type Env = z.infer<typeof envSchema>

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env: Env = parsed.data
