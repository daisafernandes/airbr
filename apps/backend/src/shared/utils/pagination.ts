export interface PaginationParams {
  page: number
  limit: number
}

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const sanitizePagination = (params?: Partial<PaginationParams>): PaginationParams => {
  const rawPage = params?.page
  const rawLimit = params?.limit
  const pageCandidate = typeof rawPage === 'number' && Number.isFinite(rawPage) ? Math.trunc(rawPage) : DEFAULT_PAGE
  const limitCandidate =
    typeof rawLimit === 'number' && Number.isFinite(rawLimit) ? Math.trunc(rawLimit) : DEFAULT_LIMIT
  const page = Math.max(1, pageCandidate)
  const limit = Math.min(MAX_LIMIT, Math.max(1, limitCandidate))
  return { page, limit }
}

export const getPaginationOffset = (params: PaginationParams): number => (params.page - 1) * params.limit

export const buildPaginatedResult = <T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> => ({
  data,
  total,
  page: params.page,
  limit: params.limit,
  totalPages: Math.ceil(total / params.limit),
})
