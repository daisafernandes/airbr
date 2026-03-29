import { User } from '@domain/entities/User'

import { UserResponseDTO } from '@application/dtos/user.dto'

export class UserMapper {
  static toDTO(user: User): UserResponseDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  static toDTOList(users: User[]): UserResponseDTO[] {
    return users.map(UserMapper.toDTO)
  }
}
