export interface UserProps {
  id: string
  name: string
  email: string
  passwordHash: string
  phone: string | null
  defaultCityId: string | null
  preferredLocale: string
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

  get phone(): string | null {
    return this.props.phone
  }

  get defaultCityId(): string | null {
    return this.props.defaultCityId
  }

  get preferredLocale(): string {
    return this.props.preferredLocale
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
      phone: this.props.phone,
      defaultCityId: this.props.defaultCityId,
      preferredLocale: this.props.preferredLocale,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    }
  }
}
