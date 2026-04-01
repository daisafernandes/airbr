import type { NextFunction, Request, Response } from 'express'

import { verifyAccessToken } from '@infrastructure/auth/jwt'
import { UnauthorizedError } from '@shared/errors/AppError'

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or invalid Authorization header'))
    return
  }

  const token = header.slice('Bearer '.length).trim()
  if (!token) {
    next(new UnauthorizedError('Missing token'))
    return
  }

  try {
    const { userId } = verifyAccessToken(token)
    req.userId = userId
    next()
  } catch {
    next(new UnauthorizedError('Invalid or expired token'))
  }
}
