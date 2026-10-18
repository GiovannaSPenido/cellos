import type { SupabaseClient } from '@supabase/supabase-js'

import SupabaseLeadRepository from '@/contexts/commercial/infrastructure/repositories/SupabaseLeadRepository'
import SupabaseClientRepository from '@/contexts/commercial/infrastructure/repositories/SupabaseClientRepository'
import SupabaseInteractionRepository from '@/contexts/commercial/infrastructure/repositories/SupabaseInteractionRepository'
import SupabaseHealthPlanRepository from '@/contexts/commercial/infrastructure/repositories/SupabaseHealthPlanRepository'
import SupabaseUserRepository from '@/contexts/commercial/infrastructure/repositories/SupabaseUserRepository'

import CreateLeadUseCase from '@/contexts/commercial/application/usecases/CreateLeadUseCase'
import ListLeadsUseCase from '@/contexts/commercial/application/usecases/ListLeadsUseCase'
import UpdateLeadUseCase from '@/contexts/commercial/application/usecases/UpdateLeadUseCase'
import ChangeLeadStatusUseCase from '@/contexts/commercial/application/usecases/ChangeLeadStatusUseCase'
import GetLeadHistoryUseCase from '@/contexts/commercial/application/usecases/GetLeadHistoryUseCase'
import RegisterInteractionUseCase from '@/contexts/commercial/application/usecases/RegisterInteractionUseCase'
import ConvertLeadToClientUseCase from '@/contexts/commercial/application/usecases/ConvertLeadToClientUseCase'
import ListClientsUseCase from '@/contexts/commercial/application/usecases/ListClientsUseCase'
import UpdateClientUseCase from '@/contexts/commercial/application/usecases/UpdateClientUseCase'
import IdentifyOpportunitiesUseCase from '@/contexts/commercial/application/usecases/IdentifyOpportunitiesUseCase'
import SimulatePriceUseCase from '@/contexts/commercial/application/usecases/SimulatePriceUseCase'
import RecommendPlanUseCase from '@/contexts/commercial/application/usecases/RecommendPlanUseCase'
import CaptureWebsiteLeadUseCase from '@/contexts/commercial/application/usecases/CaptureWebsiteLeadUseCase'

import { createServerSupabaseClient, createServiceRoleClient } from './supabase/server'

/**
 * Wires the use cases to Supabase-backed repositories.
 *
 * Built per request, never cached: the client carries the caller's session, so
 * reusing one across requests would hand a user another user's data.
 */
export function buildContainer(supabase: SupabaseClient) {
  const leads = new SupabaseLeadRepository(supabase)
  const clients = new SupabaseClientRepository(supabase)
  const interactions = new SupabaseInteractionRepository(supabase)
  const plans = new SupabaseHealthPlanRepository(supabase)
  const users = new SupabaseUserRepository(supabase)

  return {
    repositories: { leads, clients, interactions, plans, users },

    createLead: new CreateLeadUseCase(leads),
    listLeads: new ListLeadsUseCase(leads),
    updateLead: new UpdateLeadUseCase(leads),
    changeLeadStatus: new ChangeLeadStatusUseCase(leads),
    getLeadHistory: new GetLeadHistoryUseCase(leads, interactions),
    registerInteraction: new RegisterInteractionUseCase(interactions, leads),
    convertLeadToClient: new ConvertLeadToClientUseCase(leads, clients, plans),
    listClients: new ListClientsUseCase(clients, leads, plans),
    updateClient: new UpdateClientUseCase(clients, plans),
    identifyOpportunities: new IdentifyOpportunitiesUseCase(clients, leads, plans),
    simulatePrice: new SimulatePriceUseCase(plans),
    recommendPlan: new RecommendPlanUseCase(plans),
    captureWebsiteLead: new CaptureWebsiteLeadUseCase(leads, interactions, users),
  }
}

export type Container = ReturnType<typeof buildContainer>

/** For anything behind the management module: acts as the signed-in user. */
export async function getContainer(): Promise<Container> {
  return buildContainer(await createServerSupabaseClient())
}

/**
 * Bypasses row level security entirely. The only legitimate use is accepting a
 * lead from the public contact form (RF06, RNG08), where there is no session to
 * own the insert and `leads` grants anon no policy.
 *
 * Reading the plan catalogue does NOT need this: `planos_select_publico` lets
 * anon select, so `getContainer()` serves a visitor fine.
 */
export function getServiceRoleContainer(): Container {
  return buildContainer(createServiceRoleClient())
}
