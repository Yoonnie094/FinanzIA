import { createClient } from '@/lib/supabase/server'
import { groq } from '@ai-sdk/groq'
import { google } from '@ai-sdk/google'
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

  // 1. Obtener datos financieros y configuración de forma paralela
  const [transactionsResult, businessResult, goalsResult] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(100),
    supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', user.id)
  ])

  const transactions = transactionsResult.data
  const business = businessResult.data
  const goals = goalsResult.data

  if (!transactions || transactions.length === 0) {
    return Response.json({
      health: { status: 'warning', percentage: 0, message: 'Sin datos suficientes' },
      tips: [{ id: '1', title: 'Empieza a registrar', description: 'Registra tu primera venta o gasto para obtener análisis.', type: 'info' }],
      projection: 'Pendiente de datos'
    })
  }

  // 2. Validar caché (Usando columnas reales de base de datos para máxima robustez)
  const hashInput = JSON.stringify(transactions.map(t => t.id + t.amount + t.date)) + JSON.stringify(goals)
  const transactionsHash = createHash('sha256').update(hashInput).digest('hex')

  const { data: cache } = await supabase
    .from('insights_cache')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'financial_insights')
    .maybeSingle()

  if (cache && cache.insights) {
    const cacheData = cache.insights as { transactions_hash: string; insight_data: any }
    if (cacheData.transactions_hash === transactionsHash) {
      console.log('⚡ [Insights Cache] HIT - Retornando datos analíticos cacheados')
      return Response.json(cacheData.insight_data)
    }
  }

  // 3. Procesar datos básicos para el prompt
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
  const categories = [...new Set(transactions.map(t => t.category))]
  
  // 3. Consultar a la IA para el análisis profundo
  const insightsSchema = z.object({
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
  })

  const insightsSystem = `Eres un consultor financiero experto para PYMES. 
  Analiza los datos del usuario.
  Reglas:
  1. Status: 'excellent' si el margen es > 30%, 'good' > 15%, 'warning' > 0%, 'critical' si hay pérdidas.
  2. Tips: Deben ser específicos basados en el rubro del negocio (${business?.category || 'General'}).
  3. Projection: Una oración sobre la tendencia basada en los últimos movimientos.`

  const insightsPrompt = `Datos del negocio:
  - Ingresos del periodo: $${income}
  - Gastos del periodo: $${expenses}
  - Categorías activas: ${categories.join(', ')}
  - Metas actuales: ${goals?.map(g => `${g.name} (${Math.round((g.current/g.target)*100)}%)`).join(', ') || 'Ninguna'}
  - Rubro: ${business?.category || 'No especificado'}`

  let objectResult;
  try {
    // Intento 1: Groq Llama-3.3-70b (Principal)
    const { object } = await generateObject({
      model: groq('llama-3.3-70b-versatile'),
      schema: insightsSchema,
      system: insightsSystem,
      prompt: insightsPrompt,
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'insights-generate',
        metadata: { userId: user.id }
      }
    })
    objectResult = object
  } catch (groqError) {
    console.warn('⚠️ Falló generación de insights principal con Groq 70B, iniciando failover...', groqError)
    
    try {
      // Registrar failover en auditoría
      await supabase.from('error_auditoria').insert({
        usuario_id: user.id,
        error_mensaje: `FAILOVER_INSIGHTS: Groq Llama-3.3-70b falló. Error: ${groqError instanceof Error ? groqError.message : String(groqError)}`,
        tool_name: 'insights_failover_trigger',
        input_data: { error: String(groqError) }
      })

      // Intento 2: Google Gemini 1.5 Flash (Fallback Cruzado)
      if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.log('🔄 Ejecutando fallback con Google Gemini 1.5 Flash para Insights...')
        const { object } = await generateObject({
          model: google('gemini-1.5-flash'),
          schema: insightsSchema,
          system: insightsSystem,
          prompt: insightsPrompt,
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'insights-generate-fallback',
            metadata: { userId: user.id }
          }
        })
        objectResult = object
      } else {
        // Fallback secundario de Groq: Llama-3.1-8b
        console.warn('⚠️ GOOGLE_GENERATIVE_AI_API_KEY no configurada. Usando Llama-3.1-8b en Groq como fallback secundario en Insights...')
        const { object } = await generateObject({
          model: groq('llama-3.1-8b-instant'),
          schema: insightsSchema,
          system: insightsSystem,
          prompt: insightsPrompt,
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'insights-generate-fallback-groq',
            metadata: { userId: user.id }
          }
        })
        objectResult = object
      }
    } catch (fallbackError) {
      console.error('❌ Todos los proveedores fallaron en Insights:', fallbackError)
      await supabase.from('error_auditoria').insert({
        usuario_id: user.id,
        error_mensaje: `FAILOVER_INSIGHTS_CRITICAL: Todos los proveedores fallaron. Error: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
        tool_name: 'insights_critical_failure',
        input_data: { error: String(fallbackError) }
      })
      // Devolver fallback estático controlado
      objectResult = {
        health: { status: 'good' as const, percentage: 20, message: 'Análisis estándar disponible' },
        tips: [{ id: 'err', title: 'IA ocupada', description: 'No pudimos generar consejos personalizados en este momento.', type: 'info' as const }],
        projection: 'Tendencia estable'
      }
    }
  }

  // Guardar en caché antes de devolver si obtuvimos un resultado válido (Alineado con el esquema relacional)
  if (objectResult) {
    try {
      const insightsPayload = {
        transactions_hash: transactionsHash,
        insight_data: objectResult
      }

      if (cache) {
        // Actualizar registro existente
        await supabase
          .from('insights_cache')
          .update({
            insights: insightsPayload,
            valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
          })
          .eq('id', cache.id)
      } else {
        // Crear nuevo registro
        await supabase
          .from('insights_cache')
          .insert({
            user_id: user.id,
            type: 'financial_insights',
            insights: insightsPayload,
            valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
      }
      console.log('✅ [Insights Cache] Guardado con éxito en la base de datos')
    } catch (dbErr) {
      console.error('❌ Error guardando insights en insights_cache:', dbErr)
    }
  }

  return Response.json(objectResult)
}
