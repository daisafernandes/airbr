/** Sleeps for the given number of milliseconds. */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Retries an async function with exponential backoff.
 *
 * Delays (baseDelayMs × 2^(attempt−1)):
 *   attempt 1 fails → wait 1 s
 *   attempt 2 fails → wait 2 s
 *   attempt 3 fails → throw
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1_000,
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < maxAttempts) {
        const waitMs = baseDelayMs * Math.pow(2, attempt - 1)
        console.warn(
          `[Retry] Attempt ${attempt}/${maxAttempts} failed — retrying in ${waitMs}ms`,
          err instanceof Error ? err.message : err,
        )
        await delay(waitMs)
      }
    }
  }

  throw lastError
}
