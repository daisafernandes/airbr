import { IHashProvider } from '@application/services/CreateUserService'

export class BcryptHashProvider implements IHashProvider {
  private readonly saltRounds: number

  constructor(saltRounds = 10) {
    this.saltRounds = saltRounds
  }

  async hash(value: string): Promise<string> {
    const bcrypt = await import('bcryptjs')
    return bcrypt.hash(value, this.saltRounds)
  }

  async compare(value: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcryptjs')
    return bcrypt.compare(value, hash)
  }
}
