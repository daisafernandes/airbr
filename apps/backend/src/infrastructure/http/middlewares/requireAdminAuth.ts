import { timingSafeEqual } from 'crypto'
import type { NextFunction, Request, Response } from 'express'

import { env } from '@infrastructure/config/env'

function extractBearer(req: Request): string | undefined {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return undefined
  return header.slice('Bearer '.length).trim() || undefined
}

function safeCompare(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * Requires `Authorization: Bearer <ADMIN_API_KEY>` or `X-Admin-Key` when `ADMIN_API_KEY` is set.
 * In development, if `ADMIN_API_KEY` is unset, requests are allowed (local DX).
 * In production, `ADMIN_API_KEY` is always required (validated at startup).
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const key = env.ADMIN_API_KEY
  if (!key) {
    next()
    return
  }

  const fromHeader = req.headers['x-admin-key']
  const fromXAdmin = typeof fromHeader === 'string' ? fromHeader : undefined
  const provided = extractBearer(req) ?? fromXAdmin

  if (!provided || !safeCompare(provided, key)) {
    res.status(401).json({ status: 'error', message: 'Unauthorized' })
    return
  }

  next()
}
