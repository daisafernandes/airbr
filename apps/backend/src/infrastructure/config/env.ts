import { z } from 'zod'

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3333),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    DATABASE_URL: z
      .string()
      .url()
      .default('postgresql://postgres:postgres@localhost:5432/airbr'),
    OWM_API_KEY: z.string().optional(),
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
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    /** Web Push (VAPID). Required to send push notifications. */
    VAPID_PUBLIC_KEY: z.string().optional(),
    VAPID_PRIVATE_KEY: z.string().optional(),
    VAPID_SUBJECT: z.string().default('mailto:alerts@airbr.local'),
    /** Minimum hours between repeat notifications for the same alert (cooldown). */
    ALERT_COOLDOWN_HOURS: z.coerce.number().min(1).default(6),
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
  })

export type Env = z.infer<typeof envSchema>

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env: Env = parsed.data
