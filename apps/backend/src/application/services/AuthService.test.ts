import bcrypt from 'bcryptjs'

import { AuthService } from './AuthService'
import { User } from '@domain/entities/User'
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

describe('AuthService', () => {
  it('registers user with normalized email and hashed password', async () => {
    const users = new InMemoryUserRepository()
    const sut = new AuthService(users)

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
    const users = new InMemoryUserRepository()
    const existing = User.create({
      id: 'u-1',
      email: 'test@airbr.dev',
      name: 'Test',
      passwordHash: 'hash',
      createdAt: now,
      updatedAt: now,
    })
    await users.save(existing)
    const sut = new AuthService(users)

    await expect(
      sut.register({
        email: 'test@airbr.dev',
        name: 'Another',
        password: '12345678',
      }),
    ).rejects.toMatchObject<AppError>({ statusCode: 409 })
  })

  it('logs in existing user and returns token', async () => {
    const users = new InMemoryUserRepository()
    const passwordHash = await bcrypt.hash('password-123', 10)
    const existing = User.create({
      id: 'u-2',
      email: 'login@airbr.dev',
      name: 'Login User',
      passwordHash,
      createdAt: now,
      updatedAt: now,
    })
    await users.save(existing)
    const sut = new AuthService(users)

    const result = await sut.login({
      email: 'login@airbr.dev',
      password: 'password-123',
    })

    expect(result.user.id).toBe('u-2')
    expect(result.token).toEqual(expect.any(String))
  })

  it('rejects invalid credentials', async () => {
    const users = new InMemoryUserRepository()
    const sut = new AuthService(users)

    await expect(
      sut.login({
        email: 'missing@airbr.dev',
        password: 'password-123',
      }),
    ).rejects.toMatchObject<AppError>({ statusCode: 401 })
  })
})
