import { supabase } from './supabase'

export const FINANZIA_TERMS_VERSION = '1.2'

export type OnboardingData = {
  firstName: string
  lastName: string
  businessName: string
  category: string
  stage: string
  region: string
  comuna: string
  description: string
  teamSize: string
  trackingMethod: string
  hasInventory: string
  mainChallenge: string
  mainChallengeDetail?: string
  mainGoal: string
  preferredEntry: string
  termsAcceptedAt?: string
}

export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase
    .from('businesses')
    .select('ai_context')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.ai_context?.onboarding_version === 1 && Boolean(data?.ai_context?.terms_accepted_at)
}

export async function saveOnboarding(userId: string, email: string, answers: OnboardingData): Promise<void> {
  if (!supabase) throw new Error('Supabase todavía no está configurado.')

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    first_name: answers.firstName.trim(),
    last_name: answers.lastName?.trim() || null,
    email,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })
  if (profileError) throw profileError

  const aiContext = {
    onboarding_version: 1,
    stage: answers.stage,
    team_size: answers.teamSize,
    tracking_method: answers.trackingMethod,
    has_inventory: answers.hasInventory === 'yes',
    main_challenge: answers.mainChallenge,
    main_challenge_detail: answers.mainChallenge === 'other' ? answers.mainChallengeDetail?.trim() || null : null,
    main_goal: answers.mainGoal,
    preferred_entry: answers.preferredEntry,
    terms_version: FINANZIA_TERMS_VERSION,
    terms_accepted_at: answers.termsAcceptedAt || null,
    locale: 'es-CL',
    country: 'Chile',
    currency: 'CLP',
    response_style: 'Español chileno claro y cercano; explica términos financieros en palabras simples y confirma montos o fechas ambiguas antes de guardar.',
  }

  const business = {
    user_id: userId,
    name: answers.businessName.trim(),
    category: answers.category,
    description: answers.description.trim() || null,
    country: 'Chile',
    currency: 'CLP',
    region: answers.region || null,
    comuna: answers.comuna.trim() || null,
    ai_context: aiContext,
    updated_at: new Date().toISOString(),
  }

  const { data: existing, error: lookupError } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()
  if (lookupError) throw lookupError

  const result = existing?.id
    ? await supabase.from('businesses').update(business).eq('id', existing.id).eq('user_id', userId)
    : await supabase.from('businesses').insert(business)
  if (result.error) throw result.error
}
