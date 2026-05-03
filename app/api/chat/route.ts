import {
  convertToModelMessages,
  InferUITools,
  stepCountIs,
  streamText,
  tool,
  UIDataTypes,
  UIMessage,
  validateUIMessages,
} from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

// Tool to add a transaction to the database
const addTransactionTool = tool({
  description: 'Registra una transaccion financiera (gasto o ingreso) en la base de datos del usuario',
  inputSchema: z.object({
    concept: z.string().describe('Descripcion breve de la transaccion'),
    amount: z.number().describe('Monto de la transaccion (positivo para ingresos, negativo para gastos)'),
    category: z.string().describe('Categoria de la transaccion (ej: Alimentos, Transporte, Ventas, Servicios)'),
    type: z.enum(['income', 'expense']).describe('Tipo: income para ingresos, expense para gastos'),
  }),
  async execute({ concept, amount, category, type }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        concept,
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        category,
        type,
        date: new Date().toISOString(),
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { 
      success: true, 
      transaction: data,
      message: type === 'income' 
        ? `Ingreso de $${Math.abs(amount).toLocaleString('es-CL')} registrado en ${category}`
        : `Gasto de $${Math.abs(amount).toLocaleString('es-CL')} registrado en ${category}`
    }
  },
})

// Tool to get transactions summary
const getTransactionsSummaryTool = tool({
  description: 'Obtiene un resumen de las transacciones del usuario, incluyendo balance, ingresos y gastos',
  inputSchema: z.object({
    period: z.enum(['today', 'week', 'month', 'all']).describe('Periodo de tiempo para el resumen').nullable(),
  }),
  async execute({ period }) {
    const supabase = await createClient()
    
    let query = supabase.from('transactions').select('*')
    
    const now = new Date()
    if (period === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      query = query.gte('date', today)
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('date', weekAgo)
    } else if (period === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      query = query.gte('date', monthStart)
    }
    
    const { data, error } = await query.order('date', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    const transactions = data || []
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

    return {
      success: true,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      recentTransactions: transactions.slice(0, 5).map(t => ({
        concept: t.concept,
        amount: t.amount,
        category: t.category,
        type: t.type,
        date: t.date,
      })),
    }
  },
})

const tools = {
  addTransaction: addTransactionTool,
  getTransactionsSummary: getTransactionsSummaryTool,
} as const

export type ChatMessage = UIMessage<
  never,
  UIDataTypes,
  InferUITools<typeof tools>
>

export async function POST(req: Request) {
  const body = await req.json()

  const messages = await validateUIMessages<ChatMessage>({
    messages: body.messages,
    tools,
  })

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: `Eres un asistente financiero inteligente para emprendedores hispanohablantes. Tu trabajo es ayudar a registrar transacciones financieras de manera conversacional.

REGLAS IMPORTANTES:
1. Interpreta mensajes coloquiales como "Gaste 20 lucas en harina" o "Vendi 3 tortas a 15 mil cada una"
2. "Lucas" o "lukas" = miles de pesos (20 lucas = 20000 pesos)
3. Siempre confirma el registro con un mensaje amigable
4. Categoriza automaticamente: Alimentos, Transporte, Servicios, Ventas, Insumos, Otros
5. Si no estas seguro del tipo (ingreso/gasto), pregunta
6. Responde siempre en espanol

EJEMPLOS DE INTERPRETACION:
- "Gaste 5 lucas en el micro" -> Gasto de 5000 en Transporte
- "Vendi una torta a 25 mil" -> Ingreso de 25000 en Ventas
- "Pague la luz, 30 lucas" -> Gasto de 30000 en Servicios
- "Me pagaron 100 lucas por un pedido" -> Ingreso de 100000 en Ventas`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools,
  })

  return result.toUIMessageStreamResponse()
}
