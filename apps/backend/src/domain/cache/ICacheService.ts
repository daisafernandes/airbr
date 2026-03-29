export interface ICacheService {
  get<T>(key: string): T | undefined
  set<T>(key: string, value: T, ttlSeconds?: number): void
  invalidate(key: string): void
  invalidateByPrefix(prefix: string): void
}
