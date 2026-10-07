import Lead from '../entities/Lead'

/**
 * Contract the infrastructure layer must satisfy. Implementations are verified
 * at compile time via `implements LeadRepository`.
 */
export interface LeadRepository {
  save(lead: Lead): Promise<Lead>
  findById(id: string): Promise<Lead | null>
  findByEmail(email: string): Promise<Lead | null>
  findByPhone(phone: string): Promise<Lead | null>
  findAll(): Promise<Lead[]>
  update(lead: Lead): Promise<Lead>
  delete(id: string): Promise<void>
}

export default LeadRepository
