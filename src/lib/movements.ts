import { initialMovements, type Movement } from '../types'
import { supabase } from './supabase'

const STORAGE_KEY = 'finanzia.movements.v1'

function localMovements(): Movement[] {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) return JSON.parse(saved) as Movement[]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMovements))
  return initialMovements
}

async function authenticatedUserId() {
  if (!supabase) return null
  const { data: auth } = await supabase.auth.getUser()
  return auth.user?.id ?? null
}

export async function loadMovements(): Promise<Movement[]> {
  if (!supabase) return localMovements()
  const userId = await authenticatedUserId()
  if (!userId) return localMovements()
  const { data, error } = await supabase.from('transactions').select('id,type,concept,category,amount,date').order('date', { ascending: false }).limit(100)
  if (error) throw error
  return (data ?? []).map((row) => ({ id: row.id, type: row.type, description: row.concept, category: row.category ?? 'Otros gastos', amount: Number(row.amount), date: row.date }))
}

export async function saveMovement(movement: Movement): Promise<void> {
  if (!supabase) {
    const updated = [movement, ...localMovements()]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return
  }
  const userId = await authenticatedUserId()
  if (!userId) {
    const updated = [movement, ...localMovements()]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return
  }
  const { error } = await supabase.from('transactions').insert({ user_id: userId, type: movement.type, concept: movement.description, category: movement.category, amount: movement.amount, date: movement.date })
  if (error) throw error
}
