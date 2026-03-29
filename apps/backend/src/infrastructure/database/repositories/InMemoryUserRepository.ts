import { User } from '@domain/entities/User'
import { IUserRepository } from '@domain/repositories/IUserRepository'

import { PaginatedResult, PaginationParams, buildPaginatedResult } from '@shared/utils/pagination'

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = []

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) ?? null
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<User>> {
    const start = (params.page - 1) * params.limit
    const paginated = this.users.slice(start, start + params.limit)
    return buildPaginatedResult(paginated, this.users.length, params)
  }

  async save(user: User): Promise<void> {
    this.users.push(user)
  }

  async update(user: User): Promise<void> {
    const index = this.users.findIndex(u => u.id === user.id)
    if (index >= 0) this.users[index] = user
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== id)
  }
}
