import { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'

export const validateBody =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body)
    next()
  }

export const validateQuery =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    req.query = schema.parse(req.query) as Record<string, string>
    next()
  }
