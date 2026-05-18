import { createClient } from '@/lib/supabase/server'
import { groq } from '@ai-sdk/groq'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createHash } from 'crypto'

export const maxDuration = 30

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('No autorizado', { status: 401 })
  }

  // 1. Obtener datos financieros recientes
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(100)

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: goals } = await supabase
    .from('financial_goals')
    .select('*')
    .eq('user_id', user.id)

  if (!transactions || transactions.length === 0) {
    return Response.json({
      health: { status: 'warning', percentage: 0, message: 'Sin datos suficientes' },
      tips: [{ id: '1', title: 'Empieza a registrar', description: 'Registra tu primera venta o gasto para obtener análisis.', type: 'info' }],
      projection: 'Pendiente de datos'
    })
  }

  // 2. Validar caché
  const hashInput = JSON.stringify(transactions.map(t => t.id + t.amount + t.date)) + JSON.stringify(goals)
  const transactionsHash = createHash('sha256').update(hashInput).digest('hex')

  const { data: cache } = await supabase
    .from('insights_cache')
    .select('*')
    .eq('user_id', user.id)
    .eq('transactions_hash', transactionsHash)
    .single()

  if (cache) {
    return Response.json(cache.insight_data)
  }

  // 3. Procesar datos básicos para el prompt
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
  const categories = [...new Set(transactions.map(t => t.category))]
  
  // 3. Consultar a la IA para el análisis profundo
  try {
    const { object } = await generateObject({
      model: groq('llama-3.3-70b-versatile'),
      schema: z.object({
        health: z.object({
          status: z.enum(['excellent', 'good', 'warning', 'critical']),
          percentage: z.number(),
          message: z.string(),
        }),
        tips: z.array(z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          type: z.enum(['info', 'warning', 'success']),
        })),
        projection: z.string(),
      }),
      system: `Eres un consultor financiero experto para PYMES. 
      Analiza los datos del usuario.
      Reglas:
      1. Status: 'excellent' si el margen es > 30%, 'good' > 15%, 'warning' > 0%, 'critical' si hay pérdidas.
      2. Tips: Deben ser específicos basados en el rubro del negocio (${business?.category || 'General'}).
      3. Projection: Una oración sobre la tendencia basada en los últimos movimientos.`,
      prompt: `Datos del negocio:
      - Ingresos del periodo: $${income}
      - Gastos del periodo: $${expenses}
      - Categorías activas: ${categories.join(', ')}
      - Metas actuales: ${goals?.map(g => `${g.name} (${Math.round((g.current/g.target)*100)}%)`).join(', ') || 'Ninguna'}
      - Rubro: ${business?.category || 'No especificado'}`
    })

    // Guardar en caché antes de devolver
    await supabase.from('insights_cache').insert({
      user_id: user.id,
      transactions_hash: transactionsHash,
      insight_data: object
    })

    return Response.json(object)
  } catch (error) {
    console.error('Error generating AI object:', error)
    return Response.json({
      health: { status: 'good', percentage: 20, message: 'Análisis estándar disponible' },
      tips: [{ id: 'err', title: 'IA ocupada', description: 'No pudimos generar consejos personalizados en este momento.', type: 'info' }],
      projection: 'Tendencia estable'
    })
  }
}
