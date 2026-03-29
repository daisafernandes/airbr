import NodeCache from 'node-cache'

import type { ICacheService } from '@domain/cache/ICacheService'

const DEFAULT_TTL_SECONDS = 60 * 15 // 15 min

export class NodeCacheService implements ICacheService {
  private readonly cache: NodeCache

  constructor(defaultTtlSeconds = DEFAULT_TTL_SECONDS) {
    this.cache = new NodeCache({ stdTTL: defaultTtlSeconds, useClones: false })
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key)
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    if (ttlSeconds !== undefined) {
      this.cache.set(key, value, ttlSeconds)
    } else {
      this.cache.set(key, value)
    }
  }

  invalidate(key: string): void {
    this.cache.del(key)
  }

  invalidateByPrefix(prefix: string): void {
    const keys = this.cache.keys().filter((k) => k.startsWith(prefix))
    this.cache.del(keys)
  }
}
