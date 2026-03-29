export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

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
