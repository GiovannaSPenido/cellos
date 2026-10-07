import User from '../entities/User'

export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findAllActive(): Promise<User[]>
  /** Fallback owner for a lead captured on the website (RNG08). */
  findDefaultSalesperson(): Promise<User | null>
  save(user: User): Promise<User>
  update(user: User): Promise<User>
}

export default UserRepository
