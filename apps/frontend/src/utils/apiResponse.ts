/** API may return a bare array or `{ data: T[] }` (paginated wrapper). */
export interface PaginatedListBody<T> {
  data: T[]
}

/** Matches backend `@shared/utils/pagination` `PaginatedResult`. */
export interface PaginatedResultBody<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function unwrapArrayOrPaginated<T>(payload: T[] | PaginatedListBody<T>): T[] {
  if (Array.isArray(payload)) return payload
  return Array.isArray(payload.data) ? payload.data : []
}

/** Normalize fires list responses (legacy array vs paginated body). */
export function parsePaginatedFirstPage<T>(payload: unknown): {
  items: T[]
  total: number
  totalPages: number
} {
  if (Array.isArray(payload)) return { items: payload, total: payload.length, totalPages: 1 }
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const p = payload as PaginatedResultBody<T>
    const items = Array.isArray(p.data) ? p.data : []
    const total =
      typeof p.total === 'number' && Number.isFinite(p.total) && p.total >= 0
        ? Math.trunc(p.total)
        : items.length
    const totalPages =
      typeof p.totalPages === 'number' && Number.isFinite(p.totalPages) && p.totalPages >= 1
        ? Math.trunc(p.totalPages)
        : 1
    return { items, total, totalPages }
  }
  return { items: [], total: 0, totalPages: 0 }
}
