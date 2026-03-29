import { delay } from './retry'

/**
 * Simple rate limiter that enforces a minimum interval between consecutive calls.
 * Intended for collectors that iterate over many cities and hit the same API endpoint
 * multiple times per scheduled run.
 *
 * Usage:
 *   const limiter = new RateLimiter(1_200)   // max ~50 req/min
 *   for (const city of cities) {
 *     await limiter.throttle()
 *     const data = await fetchCity(city)
 *   }
 */
export class RateLimiter {
  private lastCallAt = 0

  /**
   * @param minIntervalMs Minimum milliseconds that must elapse between calls.
   *   Set to 0 to disable throttling.
   */
  constructor(private readonly minIntervalMs: number) {}

  async throttle(): Promise<void> {
    if (this.minIntervalMs <= 0) return

    const elapsed = Date.now() - this.lastCallAt
    if (elapsed < this.minIntervalMs) {
      await delay(this.minIntervalMs - elapsed)
    }

    this.lastCallAt = Date.now()
  }
}
