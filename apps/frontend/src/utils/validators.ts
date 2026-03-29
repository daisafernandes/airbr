import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
