import Client from '../entities/Client'
import { ClientStatusValue } from '../value-objects/ClientStatus'

export interface ClientFilter {
  status?: ClientStatusValue
  search?: string
}

export interface ClientRepository {
  save(client: Client): Promise<Client>
  findById(id: string): Promise<Client | null>
  /** A lead yields at most one client (RNG05). */
  findByLeadId(leadId: string): Promise<Client | null>
  findAll(filter?: ClientFilter): Promise<Client[]>
  /** RNG07 — clients whose renewal falls on or before `until`. */
  findRenewingUntil(until: Date): Promise<Client[]>
  update(client: Client): Promise<Client>
  delete(id: string): Promise<void>
}

export default ClientRepository
