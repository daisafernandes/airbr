export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
}
