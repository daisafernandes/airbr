import rateLimit from 'express-rate-limit'

/** Applies to all `/api/v1` routes (including health). */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})

/** Stricter limit for `/api/v1/admin` (runs in addition to the global API limiter). */
export const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
})
