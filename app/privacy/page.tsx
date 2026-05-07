import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Lock } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Button asChild variant="ghost" className="mb-8 gap-2">
        <Link href="/">
          <ChevronLeft className="h-4 w-4" />
          Volver al Inicio
        </Link>
      </Button>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Política de Privacidad</h1>
      </div>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p className="text-lg">
          En FinanzIA, la seguridad de tus datos financieros es nuestra prioridad absoluta.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Datos que Recolectamos</h2>
          <p>
            Recolectamos información sobre tus transacciones (conceptos, montos, fechas) e inventarios para proporcionar el servicio de análisis y gestión. Todos los datos se almacenan de forma segura utilizando Supabase.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Uso de la Información</h2>
          <p>
            Tus datos se utilizan exclusivamente para generar tus paneles de control y para que la IA pueda responder a tus consultas específicas sobre tu negocio. No vendemos tus datos a terceros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Seguridad</h2>
          <p>
            Utilizamos encriptación de grado bancario y protocolos de autenticación seguros (Supabase Auth) para asegurar que solo tú tengas acceso a tu información financiera.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. IA y Privacidad</h2>
          <p>
            Cuando interactúas con el asistente, enviamos el contexto necesario para que la IA sea útil. No enviamos información de identificación personal innecesaria a los proveedores de modelos (Google/Groq).
          </p>
        </section>
      </div>
      
      <footer className="mt-12 border-t border-border pt-8 text-sm text-muted-foreground">
        Última actualización: Mayo 2026
      </footer>
    </div>
  )
}
