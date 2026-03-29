import { randomUUID } from 'crypto'

import { User } from '@domain/entities/User'
import { IUserRepository } from '@domain/repositories/IUserRepository'
import { IUseCase } from '@domain/use-cases/IUseCase'
import { Email } from '@domain/value-objects/Email'

import { ConflictError } from '@shared/errors/AppError'

import { CreateUserDTO, UserResponseDTO } from '@application/dtos/user.dto'
import { UserMapper } from '@application/mappers/UserMapper'

export interface IHashProvider {
  hash(value: string): Promise<string>
}

export class CreateUserService implements IUseCase<CreateUserDTO, UserResponseDTO> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashProvider: IHashProvider,
  ) {}

  async execute(input: CreateUserDTO): Promise<UserResponseDTO> {
    const email = Email.create(input.email)

    const existingUser = await this.userRepository.findByEmail(email.toString())
    if (existingUser) {
      throw new ConflictError('Email already in use')
    }

    const passwordHash = await this.hashProvider.hash(input.password)

    const user = User.create({
      id: randomUUID(),
      name: input.name,
      email: email.toString(),
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await this.userRepository.save(user)

    return UserMapper.toDTO(user)
  }
}
