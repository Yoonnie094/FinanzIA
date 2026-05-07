'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  Wallet, 
  MessageSquare, 
  BarChart3, 
  Smartphone, 
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Zap
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import type { User } from '@supabase/supabase-js'
import { ChatDemo } from './landing-page/chat-demo'

export function LandingPage({ user }: { user: User | null }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">FinanzIA</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/dashboard">Ir al Panel</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Link href="/auth/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/auth/sign-up">Comenzar Gratis</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center md:py-28 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Smartphone className="h-4 w-4" />
          Diseñado para usar en tu negocio
        </div>
        <h1 className="mb-6 max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Gestiona tus finanzas con{' '}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            inteligencia artificial
          </span>
        </h1>
        <p className="mb-10 max-w-2xl text-pretty text-lg text-muted-foreground">
          Registra tus gastos e ingresos usando lenguaje natural. Solo di 
          &quot;Gasté 20 lucas en harina&quot; y deja que la IA haga el resto. 
          <span className="block mt-2 font-medium text-primary/80">Sin planillas, sin complicaciones.</span>
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {user ? (
            <Button asChild size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8">
              <Link href="/dashboard">
                Ir a mi Panel de Control
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-6">
                <Link href="/auth/sign-up">
                  Comenzar Gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-6">
                <Link href="/auth/login">Ya tengo cuenta</Link>
              </Button>
            </>
          )}
        </div>

        {/* Dashboard preview / Chat Demo */}
        <div className="mt-16 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            {/* Left side: Interactive Chat */}
            <div className="order-2 lg:order-1">
              <ChatDemo />
            </div>
            
            {/* Right side: Real Dashboard Mockup */}
            <div className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
                {/* Fake browser bar */}
                <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-destructive/60" />
                    <div className="h-3 w-3 rounded-full bg-warning/60" />
                    <div className="h-3 w-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="flex h-6 items-center rounded bg-background/80 px-3">
                      <span className="text-xs text-muted-foreground">finanz-ia.vercel.app/dashboard</span>
                    </div>
                  </div>
                </div>
                {/* Dashboard mockup content */}
                <div className="p-6 bg-background/50">
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    {[
                      { label: 'Balance Total', value: '$1.240.000', color: 'from-primary to-primary/70' },
                      { label: 'Ingresos', value: '$890.000', color: 'from-success to-primary' },
                    ].map((card) => (
                      <div key={card.label} className={`rounded-xl bg-gradient-to-br ${card.color} p-4`}>
                        <p className="text-[10px] text-white/70">{card.label}</p>
                        <p className="text-sm font-bold text-white">{card.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-xl border border-border bg-card p-3">
                      <div className="mb-2 h-1.5 w-20 rounded bg-muted animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-2 w-full rounded bg-primary/20" />
                        <div className="h-2 w-2/3 rounded bg-accent/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground italic">
                  &quot;Toda mi información financiera organizada automáticamente&quot;
                </p>
              </div>
            </div>
          </div>
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
            {[
              {
                icon: MessageSquare,
                color: 'from-primary to-primary/70',
                title: 'Chat Inteligente',
                desc: 'Registra transacciones conversando. La IA entiende tu lenguaje coloquial y categoriza automáticamente.',
              },
              {
                icon: BarChart3,
                color: 'from-primary/80 to-success',
                title: 'Análisis Visual',
                desc: 'Visualiza tus gastos por categoría y tendencias mensuales con gráficos claros y fáciles de entender.',
              },
              {
                icon: Smartphone,
                color: 'from-accent to-accent/70',
                title: 'Móvil Primero',
                desc: 'Diseñado para usar desde tu celular mientras atiendes clientes o haces compras para tu negocio.',
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              )
            })}
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
              servicio, FinanzIA te ayuda a mantener tus cuentas claras.
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

      {/* Pricing */}
      <section className="border-t border-border bg-secondary/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Planes simples para tu negocio
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Creemos en el crecimiento de los emprendedores. Por eso, FinanzIA es gratuito para comenzar.
            </p>
          </div>
          <div className="mx-auto max-w-sm">
            <div className="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground">Plan Emprendedor</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">$0</span>
                  <span className="ml-1 text-xl font-medium text-muted-foreground">/mes</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground text-pretty">
                  Todo lo que necesitas para digitalizar tus cuentas hoy mismo.
                </p>
              </div>
              <ul className="mb-8 space-y-4">
                {[
                  'Transacciones ilimitadas',
                  'Asistente IA inteligente',
                  'Panel de control en tiempo real',
                  'Gestión de inventario básica',
                  'Exportación de reportes',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/auth/sign-up">Comenzar Ahora</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="mb-14 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              <HelpCircle className="h-4 w-4" />
              Preguntas Frecuentes
            </div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              ¿Tienes dudas?
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {[
              {
                q: '¿Cómo funciona el registro con IA?',
                a: 'Simplemente escribes (o dictas) lo que gastaste o ganaste como si estuvieras hablando con un amigo. Nuestro modelo de lenguaje entiende el contexto, extrae el monto y la categoría, y lo registra automáticamente.',
              },
              {
                q: '¿Es segura mi información?',
                a: 'Totalmente. Tus datos están encriptados y solo tú puedes acceder a ellos. No compartimos tu información financiera con terceros.',
              },
              {
                q: '¿Puedo usarlo en mi celular?',
                a: 'Sí, FinanzIA está diseñado con un enfoque "móvil primero". Puedes instalarlo en tu pantalla de inicio como una aplicación para registrar tus ventas sobre la marcha.',
              },
              {
                q: '¿Realmente es gratis?',
                a: 'Sí, el Plan Emprendedor es gratuito. Queremos ayudar a los negocios locales a formalizarse y crecer sin barreras de entrada.',
              },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-foreground hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-gradient-to-br from-primary/5 via-primary/5 to-accent/5 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Empieza a controlar tus finanzas hoy
          </h2>
          <p className="mb-8 text-muted-foreground">
            Es gratis. Solo necesitas un email para comenzar.
          </p>
          {user ? (
            <Button asChild size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8">
              <Link href="/dashboard">
                Ir al Panel ahora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-8">
              <Link href="/auth/sign-up">
                Crear Cuenta Gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <div className="flex items-center justify-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">FinanzIA</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Gestión financiera inteligente para emprendedores
          </p>
          <div className="mt-6 flex justify-center gap-6">
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">Términos de Servicio</Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Política de Privacidad</Link>
          </div>
          <p className="mt-8 text-[10px] text-muted-foreground/50">
            © {new Date().getFullYear()} FinanzIA. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
