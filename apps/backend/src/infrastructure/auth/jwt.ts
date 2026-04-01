import jwt, { type SignOptions } from 'jsonwebtoken'

import { env } from '@infrastructure/config/env'

export function getJwtSecret(): string {
  if (env.JWT_SECRET) {
    return env.JWT_SECRET
  }
  if (env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production')
  }
  return 'airbr-development-jwt-secret-min-32-chars!!'
}

export function signAccessToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  }
  return jwt.sign({ sub: userId }, getJwtSecret(), options)
}

export function verifyAccessToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, getJwtSecret()) as { sub: string }
  return { userId: decoded.sub }
}
