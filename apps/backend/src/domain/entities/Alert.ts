export type AlertChannelType = 'EMAIL' | 'PUSH'

export interface AlertProps {
  id: string
  userId: string
  cityId: string
  thresholdAqi: number
  channels: AlertChannelType[]
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export class Alert {
  private readonly props: AlertProps

  private constructor(props: AlertProps) {
    this.props = props
  }

  static create(props: AlertProps): Alert {
    return new Alert(props)
  }

  get id(): string {
    return this.props.id
  }

  get userId(): string {
    return this.props.userId
  }

  get cityId(): string {
    return this.props.cityId
  }

  get thresholdAqi(): number {
    return this.props.thresholdAqi
  }

  get channels(): AlertChannelType[] {
    return this.props.channels
  }

  get active(): boolean {
    return this.props.active
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  toJSON(): Omit<AlertProps, never> {
    return { ...this.props }
  }
}
