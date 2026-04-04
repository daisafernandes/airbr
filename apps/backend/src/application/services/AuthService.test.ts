import bcrypt from 'bcryptjs'

import { AuthService, hashPasswordResetToken } from './AuthService'
import { User } from '@domain/entities/User'
import type { ICityRepository } from '@domain/repositories/ICityRepository'
import type { IPasswordResetTokenRepository } from '@domain/repositories/IPasswordResetTokenRepository'
import type { IUserRepository } from '@domain/repositories/IUserRepository'
import { AppError } from '@shared/errors/AppError'
import type { PaginatedResult, PaginationParams } from '@shared/utils/pagination'

const now = new Date('2026-01-01T00:00:00.000Z')

class InMemoryUserRepository implements IUserRepository {
  public readonly data = new Map<string, User>()

  async findById(id: string): Promise<User | null> {
    return this.data.get(id) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.data.values()) {
      if (user.email === email) return user
    }
    return null
  }

  async findAll(_params: PaginationParams): Promise<PaginatedResult<User>> {
    return {
      data: Array.from(this.data.values()),
      total: this.data.size,
      page: 1,
      limit: this.data.size || 1,
      totalPages: this.data.size > 0 ? 1 : 0,
    }
  }

  async save(user: User): Promise<void> {
    this.data.set(user.id, user)
  }

  async update(user: User): Promise<void> {
    this.data.set(user.id, user)
  }

  async delete(id: string): Promise<void> {
    this.data.delete(id)
  }
}

class InMemoryPasswordResetTokenRepository implements IPasswordResetTokenRepository {
  public readonly rows: Array<{ id: string; userId: string; tokenHash: string; expiresAt: Date }> = []

  async deleteByUserId(userId: string): Promise<void> {
    for (let i = this.rows.length - 1; i >= 0; i--) {
      if (this.rows[i].userId === userId) this.rows.splice(i, 1)
    }
  }

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    this.rows.push({ id: `tok-${this.rows.length}`, ...data })
  }

  async findValidByTokenHash(tokenHash: string): Promise<{ id: string; userId: string } | null> {
    const row = this.rows.find((r) => r.tokenHash === tokenHash && r.expiresAt > new Date())
    return row ? { id: row.id, userId: row.userId } : null
  }

  async deleteById(id: string): Promise<void> {
    const i = this.rows.findIndex((r) => r.id === id)
    if (i >= 0) this.rows.splice(i, 1)
  }
}

class CaptureEmailSender {
  public readonly sent: Array<{ to: string; subject: string; text: string }> = []

  async send(to: string, subject: string, text: string): Promise<void> {
    this.sent.push({ to, subject, text })
  }
}

function stubCityRepository(): ICityRepository {
  return {
    findAll: async () => [],
    findAllPaginated: async () => ({ data: [], total: 0 }),
    findById: async () => null,
    findByName: async () => [],
    findNearby: async () => [],
  }
}

function makeSut() {
  const users = new InMemoryUserRepository()
  const tokens = new InMemoryPasswordResetTokenRepository()
  const email = new CaptureEmailSender()
  const sut = new AuthService(users, tokens, email, stubCityRepository())
  return { sut, users, tokens, email }
}

describe('AuthService', () => {
  it('registers user with normalized email and hashed password', async () => {
    const { sut, users } = makeSut()

    const result = await sut.register({
      email: '  USER@Email.com ',
      name: '  Daisa ',
      password: '12345678',
    })

    const persisted = await users.findByEmail('user@email.com')
    expect(persisted).not.toBeNull()
    expect(persisted?.name).toBe('Daisa')
    expect(await bcrypt.compare('12345678', persisted!.passwordHash)).toBe(true)
    expect(result.user.email).toBe('user@email.com')
    expect(result.token).toEqual(expect.any(String))
  })

  it('throws conflict when email already exists', async () => {
    const { sut, users } = makeSut()
    const existing = User.create({
      id: 'u-1',
      email: 'test@airbr.dev',
      name: 'Test',
      passwordHash: 'hash',
      phone: null,
      defaultCityId: null,
      preferredLocale: 'pt',
      createdAt: now,
      updatedAt: now,
    })
    await users.save(existing)

    await expect(
      sut.register({
        email: 'test@airbr.dev',
        name: 'Another',
        password: '12345678',
      }),
    ).rejects.toMatchObject<AppError>({ statusCode: 409 })
  })

  it('logs in existing user and returns token', async () => {
    const { sut, users } = makeSut()
    const passwordHash = await bcrypt.hash('password-123', 10)
    const existing = User.create({
      id: 'u-2',
      email: 'login@airbr.dev',
      name: 'Login User',
      passwordHash,
      phone: null,
      defaultCityId: null,
      preferredLocale: 'pt',
      createdAt: now,
      updatedAt: now,
    })
    await users.save(existing)

    const result = await sut.login({
      email: 'login@airbr.dev',
      password: 'password-123',
    })

    expect(result.user.id).toBe('u-2')
    expect(result.token).toEqual(expect.any(String))
  })

  it('rejects invalid credentials', async () => {
    const { sut } = makeSut()

    await expect(
      sut.login({
        email: 'missing@airbr.dev',
        password: 'password-123',
      }),
    ).rejects.toMatchObject<AppError>({ statusCode: 401 })
  })

  it('requestPasswordReset stores token and sends email for existing user', async () => {
    const { sut, users, tokens, email } = makeSut()
    await users.save(
      User.create({
        id: 'u-reset',
        email: 'reset@airbr.dev',
        name: 'Reset',
        passwordHash: 'x',
        phone: null,
        defaultCityId: null,
        preferredLocale: 'pt',
        createdAt: now,
        updatedAt: now,
      }),
    )

    await sut.requestPasswordReset('reset@airbr.dev')

    expect(tokens.rows).toHaveLength(1)
    expect(tokens.rows[0].expiresAt.getTime()).toBeGreaterThan(Date.now())
    expect(email.sent).toHaveLength(1)
    expect(email.sent[0].to).toBe('reset@airbr.dev')
    expect(email.sent[0].text).toContain('/reset-password?token=')
  })

  it('requestPasswordReset does nothing when email unknown', async () => {
    const { sut, tokens, email } = makeSut()
    await sut.requestPasswordReset('nobody@airbr.dev')
    expect(tokens.rows).toHaveLength(0)
    expect(email.sent).toHaveLength(0)
  })

  it('resetPassword updates password and consumes token', async () => {
    const { sut, users, tokens } = makeSut()
    await users.save(
      User.create({
        id: 'u-rp',
        email: 'rp@airbr.dev',
        name: 'RP',
        passwordHash: await bcrypt.hash('old-pass-12', 10),
        phone: null,
        defaultCityId: null,
        preferredLocale: 'pt',
        createdAt: now,
        updatedAt: now,
      }),
    )

    const raw = 'a'.repeat(64)
    await tokens.create({
      userId: 'u-rp',
      tokenHash: hashPasswordResetToken(raw),
      expiresAt: new Date(Date.now() + 3600_000),
    })

    await sut.resetPassword(raw, 'new-pass-12')

    const updated = await users.findByEmail('rp@airbr.dev')
    expect(await bcrypt.compare('new-pass-12', updated!.passwordHash)).toBe(true)
    expect(tokens.rows).toHaveLength(0)
  })

  it('resetPassword rejects invalid token', async () => {
    const { sut } = makeSut()
    await expect(sut.resetPassword('bad', '12345678')).rejects.toMatchObject<AppError>({ statusCode: 400 })
  })
})
