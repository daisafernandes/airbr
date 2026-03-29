import { z } from 'zod'

export const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
})

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
})

export type CreateUserDTO = z.infer<typeof CreateUserSchema>
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>

export interface UserResponseDTO {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}
