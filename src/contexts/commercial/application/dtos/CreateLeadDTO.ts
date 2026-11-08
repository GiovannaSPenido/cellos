import { PersonTypeValue } from '../../domain/value-objects/PersonType'

/** Input for registering a lead (RF01). */
export interface CreateLeadDTO {
  /** Salesperson the lead belongs to. */
  userId: string
  name: string
  email: string
  phone: string
  personType: PersonTypeValue
  company?: string | null
  role?: string | null
  /** Digits only. Collected from a company lead (pedido do cliente, 08/11). */
  cnpj?: string | null
  planOfInterest?: string | null
  lives?: number
  /** Estimated monthly value, in reais. */
  estimatedValue?: number | string | null
  origin?: string | null
  notes?: string | null
}

export default CreateLeadDTO
