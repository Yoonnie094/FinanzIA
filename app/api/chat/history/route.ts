import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('No autorizado', { status: 401 })
  }

  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at')
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

  // Format to Vercel AI SDK structure
  const formattedMessages = messages.reverse().map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
  }))

  return new Response(JSON.stringify(formattedMessages), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
