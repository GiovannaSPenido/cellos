import HealthPlan from '../entities/HealthPlan'

export interface HealthPlanRepository {
  findById(id: string): Promise<HealthPlan | null>
  findByCode(code: string): Promise<HealthPlan | null>
  /** RF08 — the catalogue shown on the institutional site. */
  findAllActive(): Promise<HealthPlan[]>
  findAll(): Promise<HealthPlan[]>
  save(plan: HealthPlan): Promise<HealthPlan>
  update(plan: HealthPlan): Promise<HealthPlan>
}

export default HealthPlanRepository
