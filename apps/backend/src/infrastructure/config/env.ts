import { z } from 'zod'

const envSchema = z.object({
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
})
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production' && !data.ADMIN_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ADMIN_API_KEY is required when NODE_ENV is production',
        path: ['ADMIN_API_KEY'],
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
