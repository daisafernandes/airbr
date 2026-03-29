export class AppError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
    this.name = 'ConflictError'
  }
}
