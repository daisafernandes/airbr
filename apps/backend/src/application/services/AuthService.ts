import { randomUUID } from 'node:crypto'

import bcrypt from 'bcryptjs'

import { User } from '@domain/entities/User'
import type { IUserRepository } from '@domain/repositories/IUserRepository'
import { signAccessToken } from '@infrastructure/auth/jwt'
import { AppError, ConflictError, UnauthorizedError } from '@shared/errors/AppError'

const SALT_ROUNDS = 10
const MIN_PASSWORD_LENGTH = 8

export class AuthService {
  constructor(private readonly users: IUserRepository) {}

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
      createdAt: now,
      updatedAt: now,
    })

    await this.users.save(user)

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
    return { token, user: user.toJSON() }
  }

  async getProfile(userId: string): Promise<ReturnType<User['toJSON']> | null> {
    const user = await this.users.findById(userId)
    return user?.toJSON() ?? null
  }
}
