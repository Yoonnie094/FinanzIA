import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Button asChild variant="ghost" className="mb-8 gap-2">
        <Link href="/">
          <ChevronLeft className="h-4 w-4" />
          Volver al Inicio
        </Link>
      </Button>
      
      <h1 className="mb-8 text-4xl font-bold tracking-tight">Términos de Servicio</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar FinanzIA, aceptas cumplir con estos términos de servicio. Esta plataforma está diseñada para la gestión financiera personal y de pequeños negocios.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Uso de Inteligencia Artificial</h2>
          <p>
            FinanzIA utiliza modelos de lenguaje avanzados para procesar tus registros. Aunque nos esforzamos por la precisión, los consejos de la IA no sustituyen el asesoramiento de un contador profesional matriculado.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Responsabilidad</h2>
          <p>
            El usuario es responsable de la exactitud de los datos ingresados. FinanzIA no se hace responsable de decisiones financieras tomadas basadas exclusivamente en las sugerencias del asistente virtual.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de actualizar estos términos en cualquier momento para reflejar cambios en la tecnología o en la normativa legal.
          </p>
        </section>
      </div>
      
      <footer className="mt-12 border-t border-border pt-8 text-sm text-muted-foreground">
        Última actualización: Mayo 2026
      </footer>
    </div>
  )
}
