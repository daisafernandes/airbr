import { createHash, randomBytes, randomUUID } from 'node:crypto'

import bcrypt from 'bcryptjs'

import { User } from '@domain/entities/User'
import type { ICityRepository } from '@domain/repositories/ICityRepository'
import type { IPasswordResetTokenRepository } from '@domain/repositories/IPasswordResetTokenRepository'
import type { IUserRepository } from '@domain/repositories/IUserRepository'
import { signAccessToken } from '@infrastructure/auth/jwt'
import { env } from '@infrastructure/config/env'
import { AppError, ConflictError, UnauthorizedError } from '@shared/errors/AppError'
import { productMetrics } from '@shared/metrics/productMetrics'

const SALT_ROUNDS = 10
const MIN_PASSWORD_LENGTH = 8
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000
const RESET_TOKEN_BYTES = 32

/** E.164: + followed by 1–15 digits (max 15 total national significant digits). */
const E164_REGEX = /^\+[1-9]\d{1,14}$/

export function hashPasswordResetToken(raw: string): string {
  return createHash('sha256').update(raw, 'utf8').digest('hex')
}

function buildPasswordResetLink(frontendUrl: string, rawToken: string): string {
  const base = frontendUrl.replace(/\/$/, '')
  return `${base}/reset-password?token=${encodeURIComponent(rawToken)}`
}

function parseE164OrNull(raw: string | null): string | null {
  if (raw === null) return null
  const trimmed = raw.trim()
  if (trimmed === '') return null
  if (!E164_REGEX.test(trimmed)) {
    throw new AppError('Invalid phone number (use international format, e.g. +5511999998888)', 400)
  }
  return trimmed
}

export type UpdateProfileInput = {
  name?: string
  phone?: string | null
  defaultCityId?: string | null
  preferredLocale?: 'pt' | 'en' | 'es'
}

export class AuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly passwordResetTokens: IPasswordResetTokenRepository,
    private readonly emailSender: { send(to: string, subject: string, text: string): Promise<void> },
    private readonly cities: ICityRepository,
  ) {}

  async register(input: { email: string; password: string; name: string }): Promise<{ token: string; user: ReturnType<User['toJSON']> }> {
    const email = input.email.toLowerCase().trim()
    const name = input.name.trim()
    if (name.length < 1) {
      throw new AppError('Name is required', 400)
    }
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400)
    }

    const existing = await this.users.findByEmail(email)
    if (existing) {
      throw new ConflictError('Email already registered')
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)
    const now = new Date()
    const id = randomUUID()
    const user = User.create({
      id,
      email,
      name,
      passwordHash,
      phone: null,
      defaultCityId: null,
      preferredLocale: 'pt',
      createdAt: now,
      updatedAt: now,
    })

    await this.users.save(user)
    productMetrics.incUserRegistration()

    const token = signAccessToken(user.id)
    return { token, user: user.toJSON() }
  }

  async login(input: { email: string; password: string }): Promise<{ token: string; user: ReturnType<User['toJSON']> }> {
    const email = input.email.toLowerCase().trim()
    const user = await this.users.findByEmail(email)
    if (!user) {
      throw new UnauthorizedError('Invalid email or password')
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash)
    if (!ok) {
      throw new UnauthorizedError('Invalid email or password')
    }

    const token = signAccessToken(user.id)
    productMetrics.incLogin()
    return { token, user: user.toJSON() }
  }

  async getProfile(userId: string): Promise<ReturnType<User['toJSON']> | null> {
    const user = await this.users.findById(userId)
    return user?.toJSON() ?? null
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<ReturnType<User['toJSON']>> {
    const user = await this.users.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    let name = user.name
    if (input.name !== undefined) {
      const trimmed = input.name.trim()
      if (trimmed.length < 1) {
        throw new AppError('Name is required', 400)
      }
      name = trimmed
    }

    let phone = user.phone
    if (input.phone !== undefined) {
      const raw =
        input.phone === null || input.phone === '' ? null : String(input.phone).trim()
      phone = parseE164OrNull(raw)
    }

    let defaultCityId = user.defaultCityId
    if (input.defaultCityId !== undefined) {
      if (input.defaultCityId === null) {
        defaultCityId = null
      } else {
        const city = await this.cities.findById(input.defaultCityId)
        if (!city) {
          throw new AppError('City not found', 400)
        }
        defaultCityId = input.defaultCityId
      }
    }

    let preferredLocale = user.preferredLocale
    if (input.preferredLocale !== undefined) {
      preferredLocale = input.preferredLocale
    }

    const updated = User.create({
      id: user.id,
      email: user.email,
      name,
      passwordHash: user.passwordHash,
      phone,
      defaultCityId,
      preferredLocale,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    })
    await this.users.update(updated)
    return updated.toJSON()
  }

  /**
   * Always resolves successfully with a neutral message (does not reveal whether the email exists).
   */
  async requestPasswordReset(emailInput: string): Promise<void> {
    const email = emailInput.toLowerCase().trim()
    const user = await this.users.findByEmail(email)
    if (!user) {
      return
    }

    await this.passwordResetTokens.deleteByUserId(user.id)

    const rawToken = randomBytes(RESET_TOKEN_BYTES).toString('hex')
    const tokenHash = hashPasswordResetToken(rawToken)
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS)
    await this.passwordResetTokens.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    })

    const link = buildPasswordResetLink(env.FRONTEND_URL, rawToken)
    const subject = 'Redefinição de senha — RespirA'
    const text = [
      'Olá,',
      '',
      'Recebemos um pedido para redefinir a senha da sua conta.',
      `Use o link abaixo (válido por 1 hora):`,
      link,
      '',
      'Se você não pediu isso, ignore este e-mail.',
    ].join('\n')

    await this.emailSender.send(user.email, subject, text)
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400)
    }
    const tokenHash = hashPasswordResetToken(rawToken.trim())
    const record = await this.passwordResetTokens.findValidByTokenHash(tokenHash)
    if (!record) {
      throw new AppError('Invalid or expired reset token', 400)
    }

    const user = await this.users.findById(record.userId)
    if (!user) {
      await this.passwordResetTokens.deleteById(record.id)
      throw new AppError('Invalid or expired reset token', 400)
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
    const updated = User.create({
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash,
      phone: user.phone,
      defaultCityId: user.defaultCityId,
      preferredLocale: user.preferredLocale,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    })
    await this.users.update(updated)
    await this.passwordResetTokens.deleteById(record.id)
  }
}
