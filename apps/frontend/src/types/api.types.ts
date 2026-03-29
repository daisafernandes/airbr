export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  status: 'error' | 'validation_error'
  message: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
