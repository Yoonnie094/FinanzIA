import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

// Limitación de tasa en memoria (Nota: se reinicia con el servidor)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

export default async function middleware(request: NextRequest) {
  // Aplicar límite solo a la API de chat para no afectar la navegación
  if (request.nextUrl.pathname.startsWith('/api/chat')) {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const now = Date.now()
    const windowMs = 60000 // 1 minuto
    const maxRequests = 5   // 5 peticiones por minuto (ajustable)

    const rateLimit = rateLimitMap.get(ip) || { count: 0, lastReset: now }

    if (now - rateLimit.lastReset > windowMs) {
      rateLimit.count = 0
      rateLimit.lastReset = now
    }

    if (rateLimit.count >= maxRequests) {
      return new NextResponse('Has alcanzado el límite de mensajes. Espera un minuto.', { 
        status: 429,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }

    rateLimit.count++
    rateLimitMap.set(ip, rateLimit)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
