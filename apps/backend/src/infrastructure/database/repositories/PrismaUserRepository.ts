import { User } from '@domain/entities/User'
import type { IUserRepository } from '@domain/repositories/IUserRepository'
import { prisma } from '@infrastructure/database/prisma'
import type { PaginatedResult, PaginationParams } from '@shared/utils/pagination'
import { buildPaginatedResult } from '@shared/utils/pagination'

const toDomain = (row: {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}): User =>
  User.create({
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { id } })
    return row ? toDomain(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    return row ? toDomain(row) : null
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<User>> {
    const skip = (params.page - 1) * params.limit
    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.limit,
      }),
      prisma.user.count(),
    ])

    return buildPaginatedResult(
      rows.map(toDomain),
      total,
      params,
    )
  }

  async save(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id,
        passwordHash: user.passwordHash,
        email: user.email.toLowerCase().trim(),
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  }

  async update(user: User): Promise<void> {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: user.passwordHash,
        email: user.email.toLowerCase().trim(),
        name: user.name,
        updatedAt: user.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }
}
