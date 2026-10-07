import ValueObject from '@/shared/domain/base/ValueObject'
import DomainException from '@/shared/domain/exceptions/DomainException'

export type ClientStatusValue = 'ACTIVE' | 'RENEWAL_DUE' | 'OVERDUE' | 'CANCELLED'

export const CLIENT_STATUS_VALUES: readonly ClientStatusValue[] = [
  'ACTIVE',
  'RENEWAL_DUE',
  'OVERDUE',
  'CANCELLED',
]

export class ClientStatus extends ValueObject<ClientStatusValue> {
  static readonly ACTIVE: ClientStatusValue = 'ACTIVE'
  static readonly RENEWAL_DUE: ClientStatusValue = 'RENEWAL_DUE'
  static readonly OVERDUE: ClientStatusValue = 'OVERDUE'
  static readonly CANCELLED: ClientStatusValue = 'CANCELLED'

  readonly value: ClientStatusValue

  constructor(value: string) {
    super()
    if (!CLIENT_STATUS_VALUES.includes(value as ClientStatusValue)) {
      throw new DomainException(`Invalid client status: ${value}`)
    }
    this.value = value as ClientStatusValue
  }

  isActive(): boolean {
    return this.value === 'ACTIVE' || this.value === 'RENEWAL_DUE'
  }

  toPrimitive(): ClientStatusValue {
    return this.value
  }

  static create(value: string): ClientStatus {
    return new ClientStatus(value)
  }
}

export default ClientStatus
