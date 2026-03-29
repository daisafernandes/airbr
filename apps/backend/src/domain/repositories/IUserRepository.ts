import { User } from '@domain/entities/User'

import { PaginatedResult, PaginationParams } from '@shared/utils/pagination'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findAll(params: PaginationParams): Promise<PaginatedResult<User>>
  save(user: User): Promise<void>
  update(user: User): Promise<void>
  delete(id: string): Promise<void>
}
