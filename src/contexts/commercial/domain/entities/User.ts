import Entity, { EntityPrimitive } from '@/shared/domain/base/Entity'
import DomainException from '@/shared/domain/exceptions/DomainException'
import Email from '../value-objects/Email'
import UserProfile, { UserProfileValue } from '../value-objects/UserProfile'

export interface UserProps {
  /** Same id as the Supabase Auth user — `usuarios.id` references `auth.users`. */
  id: string
  name: string
  email: Email | string
  profile?: UserProfile | string
  active?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface UserPrimitive extends EntityPrimitive {
  name: string
  email: string
  profile: UserProfileValue
  active: boolean
}

/** An authenticated operator of the management module (section 7.5). */
export class User extends Entity {
  name: string
  email: Email
  profile: UserProfile
  active: boolean

  constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt)

    this.name = props.name
    this.email = props.email instanceof Email ? props.email : Email.create(props.email)
    this.profile =
      props.profile === undefined
        ? UserProfile.create(UserProfile.SALES)
        : props.profile instanceof UserProfile
          ? props.profile
          : UserProfile.create(props.profile)
    this.active = props.active ?? true

    this.validate()
  }

  isAdmin(): boolean {
    return this.profile.isAdmin()
  }

  /** Administrators see every lead; a salesperson sees only their own. */
  canAccessLeadOf(userId: string): boolean {
    return this.isAdmin() || this.id === userId
  }

  deactivate(): void {
    this.active = false
    this.markAsUpdated()
  }

  validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainException('User name is required')
    }
  }

  toPrimitive(): UserPrimitive {
    return {
      ...super.toPrimitive(),
      name: this.name,
      email: this.email.toPrimitive(),
      profile: this.profile.toPrimitive(),
      active: this.active,
    }
  }
}

export default User
