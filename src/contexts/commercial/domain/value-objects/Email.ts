import ValueObject from '@/shared/domain/base/ValueObject'
import DomainException from '@/shared/domain/exceptions/DomainException'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class Email extends ValueObject<string> {
  readonly value: string

  constructor(value: string) {
    super()
    this.value = Email.validate(value)
  }

  private static validate(value: string): string {
    if (!value || !EMAIL_PATTERN.test(value)) {
      throw new DomainException(`Invalid email: ${value}`)
    }
    return value
  }

  toPrimitive(): string {
    return this.value
  }

  static create(value: string): Email {
    return new Email(value)
  }
}

export default Email
