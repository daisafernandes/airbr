import { rateLimit } from 'express-rate-limit'

/** Applies to all `/api/v1` routes (including health). */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})
