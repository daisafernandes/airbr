import { AppError } from '@shared/errors/AppError'

export class Email {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(email: string): Email {
    if (!Email.isValid(email)) {
      throw new AppError('Invalid email address')
    }
    return new Email(email.toLowerCase().trim())
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  toString(): string {
    return this.value
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }
}
