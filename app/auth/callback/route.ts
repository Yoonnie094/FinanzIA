import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // El "next" es opcional, sirve para saber a dónde redirigir después del login
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Si el usuario es nuevo y no tiene negocio, mandarlo al onboarding
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', data.user.id)
        .single()

      const forwardTo = business ? next : '/onboarding/business'
      return NextResponse.redirect(`${origin}${forwardTo}`)
    }
  }

  // Si algo falla, volver al login con un error
  return NextResponse.redirect(`${origin}/auth/login?error=auth-callback-failed`)
}
