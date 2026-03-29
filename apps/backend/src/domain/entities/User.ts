export interface UserProps {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export class User {
  private readonly props: UserProps

  private constructor(props: UserProps) {
    this.props = props
  }

  static create(props: UserProps): User {
    return new User(props)
  }

  get id(): string {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get email(): string {
    return this.props.email
  }

  get passwordHash(): string {
    return this.props.passwordHash
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  toJSON(): Omit<UserProps, 'passwordHash'> {
    return {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    }
  }
}
