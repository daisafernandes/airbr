import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

import { AppError } from '@shared/errors/AppError'

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    })
    return
  }

  if (error instanceof ZodError) {
    res.status(422).json({
      status: 'validation_error',
      errors: error.flatten().fieldErrors,
    })
    return
  }

  console.error(error)

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  })
}
