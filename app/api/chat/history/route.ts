import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('No autorizado', { status: 401 })
  }

  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('id, role, content, parts, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching chat history:', error)
    return new Response(
      JSON.stringify({ error: 'Error al obtener el historial de chat' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Format to Vercel AI SDK structure. Copy array safely to prevent mutation side-effects,
  // then map the chronological messages to client schema.
  const formattedMessages = [...messages].reverse().map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    parts: (msg.parts as any) || [
      {
        type: 'text' as const,
        text: msg.content || ''
      }
    ]
  }))

  return new Response(JSON.stringify(formattedMessages), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
