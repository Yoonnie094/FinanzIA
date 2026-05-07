'use client'

import { useState } from 'react'
import { MessageSquare, Plus, BarChart3, CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    icon: MessageSquare,
    color: 'from-primary to-primary/70',
    bgColor: 'bg-primary/10',
    textColor: 'text-primary',
    title: 'Habla con el asistente IA',
    description: 'Toca el botón morado abajo a la derecha y escribe algo como:',
    example: '"Vendí 5 empanadas a $2.000 cada una"',
    tip: 'La IA entiende lenguaje natural — escribe como le contarías a un amigo.',
  },
  {
    icon: Plus,
    color: 'from-success to-success/70',
    bgColor: 'bg-success/10',
    textColor: 'text-success',
    title: 'O agrégala manualmente',
    description: 'Ve a "Registros" en el menú y toca el botón "+". Puedes agregar ingresos y gastos desde ahí.',
    example: '"Gasté $15.000 en harina para la semana"',
    tip: 'Ideal cuando no tienes tiempo de chatear — solo llena el formulario.',
  },
  {
    icon: BarChart3,
    color: 'from-accent to-accent/70',
    bgColor: 'bg-accent/10',
    textColor: 'text-accent',
    title: 'Tu dashboard se actualiza solo',
    description: 'Cada vez que registres algo, este panel se actualiza automáticamente con:',
    example: 'Gráficos, balance, salud del negocio y más',
    tip: 'Entre más datos registres, más útiles serán los análisis.',
  },
]

export function OnboardingTutorial() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
          <BarChart3 className="h-8 w-8 text-white" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          ¡Bienvenido a FinanzIA! 🎉
        </h2>
        <p className="text-muted-foreground">
          En 3 pasos vas a entender cómo funciona tu nueva herramienta financiera.
        </p>
      </div>

      {/* Step indicators */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeStep ? 'w-8 bg-primary' : 'w-2 bg-border hover:bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Step cards */}
      <div className="relative overflow-hidden">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={i}
              className={`transition-all duration-300 ${
                i === activeStep ? 'block' : 'hidden'
              }`}
            >
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color}`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Paso {i + 1} de {STEPS.length}
                    </p>
                    <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  </div>
                </div>

                <p className="mb-4 text-muted-foreground">{step.description}</p>

                <div className={`rounded-xl ${step.bgColor} px-4 py-3 mb-4`}>
                  <p className={`font-medium ${step.textColor} italic`}>
                    {step.example}
                  </p>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-secondary/50 p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground">{step.tip}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
          className="text-muted-foreground"
        >
          Anterior
        </Button>

        {activeStep < STEPS.length - 1 ? (
          <Button
            onClick={() => setActiveStep(activeStep + 1)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => {
              // Scroll al chat
              document.querySelector('[aria-label="Abrir asistente IA"]')?.dispatchEvent(new MouseEvent('click'))
            }}
          >
            ¡Empezar ahora!
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Quick tip */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Este tutorial desaparecerá automáticamente cuando registres tu primera transacción.
      </p>
    </div>
  )
}
