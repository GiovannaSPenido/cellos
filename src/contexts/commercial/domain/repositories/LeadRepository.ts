import Lead from '../entities/Lead'
import { LeadStatusValue } from '../value-objects/LeadStatus'

export interface LeadFilter {
  userId?: string
  status?: LeadStatusValue
  search?: string
}

/**
 * Contract the infrastructure layer must satisfy. Implementations are verified
 * at compile time via `implements LeadRepository`.
 */
export interface LeadRepository {
  save(lead: Lead): Promise<Lead>
  findById(id: string): Promise<Lead | null>
  /** RNG01 — used to reject a duplicate e-mail. */
  findByEmail(email: string): Promise<Lead | null>
  /** RNG01 — used to reject a duplicate phone number. */
  findByPhone(phone: string): Promise<Lead | null>
  findAll(filter?: LeadFilter): Promise<Lead[]>
  /** Leads with a scheduled contact up to `until`, for the agenda. */
  findDueForContact(until: Date, userId?: string): Promise<Lead[]>
  update(lead: Lead): Promise<Lead>
  delete(id: string): Promise<void>
}

export default LeadRepository
