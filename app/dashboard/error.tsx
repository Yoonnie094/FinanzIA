'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Aquí se conectaría con un servicio de monitoreo de errores en el futuro (ej. Sentry)
    console.error('Dashboard Error:', error)
  }, [error])

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6 px-4 text-center animate-in fade-in duration-500">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Algo no salió como esperábamos
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Tuvimos un problema al cargar tu panel de control. Esto suele ser un fallo temporal de conexión.
        </p>
      </div>
      <Button 
        onClick={() => reset()} 
        className="gap-2"
        size="lg"
      >
        <RefreshCcw className="h-4 w-4" />
        Reintentar conexión
      </Button>
    </div>
  )
}
