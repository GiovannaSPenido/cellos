import ValueObject from '@/shared/domain/base/ValueObject'
import DomainException from '@/shared/domain/exceptions/DomainException'

/** The two authenticated actors of section 7.5: Administrador and Vendedor/Gestor. */
export type UserProfileValue = 'ADMIN' | 'SALES'

export const USER_PROFILE_VALUES: readonly UserProfileValue[] = ['ADMIN', 'SALES']

export class UserProfile extends ValueObject<UserProfileValue> {
  static readonly ADMIN: UserProfileValue = 'ADMIN'
  static readonly SALES: UserProfileValue = 'SALES'

  readonly value: UserProfileValue

  constructor(value: string) {
    super()
    if (!USER_PROFILE_VALUES.includes(value as UserProfileValue)) {
      throw new DomainException(`Invalid user profile: ${value}`)
    }
    this.value = value as UserProfileValue
  }

  isAdmin(): boolean {
    return this.value === 'ADMIN'
  }

  toPrimitive(): UserProfileValue {
    return this.value
  }

  static create(value: string): UserProfile {
    return new UserProfile(value)
  }
}

export default UserProfile
