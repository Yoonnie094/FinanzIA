import { createClient } from '@/lib/supabase/server'
import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'

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

  // 2. Procesar datos básicos para el prompt
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
  const categories = [...new Set(transactions.map(t => t.category))]
  
  // 3. Consultar a la IA para el análisis profundo
  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system: `Eres un consultor financiero experto para PYMES. 
    Analiza los datos del usuario y genera un reporte en formato JSON con la siguiente estructura:
    {
      "health": { "status": "excellent" | "good" | "warning" | "critical", "percentage": number, "message": string },
      "tips": [ { "id": string, "title": string, "description": string, "type": "info" | "warning" | "success" } ],
      "projection": string
    }
    Reglas:
    1. Status: 'excellent' si el margen es > 30%, 'good' > 15%, 'warning' > 0%, 'critical' si hay pérdidas.
    2. Tips: Deben ser específicos basados en el rubro del negocio (${business?.category || 'General'}).
    3. Projection: Una oración sobre la tendencia basada en los últimos movimientos.
    4. Responde SOLO con el JSON.`,
    prompt: `Datos del negocio:
    - Ingresos del periodo: $${income}
    - Gastos del periodo: $${expenses}
    - Categorías activas: ${categories.join(', ')}
    - Metas actuales: ${goals?.map(g => `${g.name} (${Math.round((g.current/g.target)*100)}%)`).join(', ') || 'Ninguna'}
    - Rubro: ${business?.category || 'No especificado'}`
  })

  try {
    const analysis = JSON.parse(text)
    return Response.json(analysis)
  } catch (e) {
    console.error('Error parsing AI response:', text)
    return Response.json({
      health: { status: 'good', percentage: 20, message: 'Análisis estándar disponible' },
      tips: [{ id: 'err', title: 'IA ocupada', description: 'No pudimos generar consejos personalizados en este momento.', type: 'info' }],
      projection: 'Tendencia estable'
    })
  }
}
