/** API may return a bare array or `{ data: T[] }` (paginated wrapper). */
export interface PaginatedListBody<T> {
  data: T[]
}

export function unwrapArrayOrPaginated<T>(payload: T[] | PaginatedListBody<T>): T[] {
  if (Array.isArray(payload)) return payload
  return Array.isArray(payload.data) ? payload.data : []
}
