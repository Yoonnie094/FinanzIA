import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  Wallet, 
  MessageSquare, 
  BarChart3, 
  Smartphone, 
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.55_0.22_280)] to-[oklch(0.6_0.18_250)]">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">FinanzasAI</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Link href="/auth/login">Iniciar Sesion</Link>
            </Button>
            <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/auth/sign-up">Comenzar Gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center md:py-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Smartphone className="h-4 w-4" />
          Disenado para usar en tu negocio
        </div>
        <h1 className="mb-6 max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Gestiona tus finanzas con{' '}
          <span className="bg-gradient-to-r from-[oklch(0.55_0.22_280)] via-[oklch(0.6_0.18_250)] to-[oklch(0.7_0.18_340)] bg-clip-text text-transparent">
            inteligencia artificial
          </span>
        </h1>
        <p className="mb-10 max-w-2xl text-pretty text-lg text-muted-foreground">
          Registra tus gastos e ingresos usando lenguaje natural. Solo di 
          &quot;Gaste 20 lucas en harina&quot; y deja que la IA haga el resto.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-6">
            <Link href="/auth/sign-up">
              Comenzar Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-6">
            <Link href="/auth/login">Ya tengo cuenta</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-secondary/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-foreground md:text-4xl">
            Todo lo que necesitas para tu emprendimiento
          </h2>
          <p className="mx-auto mb-14 max-w-2xl text-center text-muted-foreground">
            Herramientas simples pero poderosas para mantener tus finanzas en orden
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.55_0.22_280)] to-[oklch(0.6_0.18_250)]">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Chat Inteligente</h3>
              <p className="text-muted-foreground">
                Registra transacciones conversando. La IA entiende tu lenguaje 
                coloquial y categoriza automaticamente.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.6_0.18_250)] to-[oklch(0.7_0.18_340)]">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Analisis Visual</h3>
              <p className="text-muted-foreground">
                Visualiza tus gastos por categoria y tendencias mensuales 
                con graficos claros y faciles de entender.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.7_0.18_340)] to-[oklch(0.65_0.2_310)]">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Movil Primero</h3>
              <p className="text-muted-foreground">
                Disenado para usar desde tu celular mientras atiendes 
                clientes o haces compras para tu negocio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Perfecto para emprendedores
            </h2>
            <p className="mb-10 text-lg text-muted-foreground">
              Ya sea que vendas tortas, manejes una tienda o tengas un 
              servicio, FinanzasAI te ayuda a mantener tus cuentas claras.
            </p>
            <ul className="space-y-4 text-left">
              {[
                'Registra ventas e ingresos al instante',
                'Controla tus gastos en insumos y servicios',
                'Ve tu balance real en tiempo real',
                'Toma mejores decisiones con datos claros',
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-gradient-to-br from-[oklch(0.55_0.22_280)]/5 via-[oklch(0.6_0.18_250)]/5 to-[oklch(0.7_0.18_340)]/5 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Empieza a controlar tus finanzas hoy
          </h2>
          <p className="mb-8 text-muted-foreground">
            Es gratis. Solo necesitas un email para comenzar.
          </p>
          <Button asChild size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-8">
            <Link href="/auth/sign-up">
              Crear Cuenta Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <div className="flex items-center justify-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.55_0.22_280)] to-[oklch(0.6_0.18_250)]">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">FinanzasAI</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Gestion financiera inteligente para emprendedores
          </p>
        </div>
      </footer>
    </div>
  )
}
