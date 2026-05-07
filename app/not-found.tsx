import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-full bg-secondary p-4 text-muted-foreground">
        <FileQuestion className="h-10 w-10" />
      </div>
      <h2 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
        Página no encontrada
      </h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        No pudimos encontrar la página que buscas. Es posible que haya sido movida o ya no exista.
      </p>
      <Button asChild variant="default">
        <Link href="/">Volver al Inicio</Link>
      </Button>
    </div>
  )
}
