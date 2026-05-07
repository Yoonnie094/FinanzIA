'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Podrías enviar el error a un servicio como Sentry aquí
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
        Algo salió mal
      </h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Lo sentimos, ha ocurrido un error inesperado. Hemos sido notificados y estamos trabajando en ello.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default" className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Reintentar
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Volver al Inicio
        </Button>
      </div>
    </div>
  )
}
