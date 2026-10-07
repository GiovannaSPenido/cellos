import Interaction from '../entities/Interaction'

export interface InteractionRepository {
  save(interaction: Interaction): Promise<Interaction>
  findById(id: string): Promise<Interaction | null>
  /** RF10 — the full history of a lead, most recent first. */
  findByLeadId(leadId: string): Promise<Interaction[]>
  /** Latest entries across all leads, for the dashboard activity feed. */
  findRecent(limit: number, userId?: string): Promise<Interaction[]>
  countByLeadId(leadId: string): Promise<number>
  delete(id: string): Promise<void>
}

export default InteractionRepository
