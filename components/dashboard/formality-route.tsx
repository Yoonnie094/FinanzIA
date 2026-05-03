'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  Circle, 
  Building2, 
  FileText, 
  Shield, 
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  title: string
  description: string
  details: string[]
  icon: typeof Building2
  completed: boolean
}

const initialSteps: Step[] = [
  {
    id: 'constitution',
    title: 'Constitucion de Empresa',
    description: 'Formaliza tu negocio como persona juridica o natural',
    details: [
      'Elige entre Persona Natural o Sociedad (SPA, LTDA, etc.)',
      'Registra en el portal Tu Empresa en un Dia (empresaenundia.cl)',
      'Obtiene tu RUT de empresa',
      'Define el giro comercial de tu negocio'
    ],
    icon: Building2,
    completed: false
  },
  {
    id: 'sii',
    title: 'Inicio de Actividades SII',
    description: 'Registra tu actividad economica ante el SII',
    details: [
      'Ingresa a sii.cl con tu Clave Unica',
      'Selecciona "Inicio de Actividades"',
      'Indica tu actividad economica (codigo CIIU)',
      'Elige regimen tributario (Pro Pyme, 14D3, etc.)',
      'Solicita timbraje de boletas o facturas'
    ],
    icon: FileText,
    completed: false
  },
  {
    id: 'health',
    title: 'Resolucion Sanitaria',
    description: 'Obtiene permisos sanitarios si vendes alimentos',
    details: [
      'Aplica si elaboras o vendes alimentos',
      'Solicita en tu SEREMI de Salud regional',
      'Presenta planos del local y procedimientos',
      'Aprueba inspeccion sanitaria',
      'Renueva anualmente'
    ],
    icon: Shield,
    completed: false
  },
  {
    id: 'patent',
    title: 'Patente Municipal',
    description: 'Autoriza el funcionamiento en tu comuna',
    details: [
      'Solicita en la Municipalidad de tu comuna',
      'Presenta Inicio de Actividades del SII',
      'Adjunta contrato de arriendo o titulo de propiedad',
      'Paga patente comercial anual',
      'Obtiene permiso de publicidad si aplica'
    ],
    icon: BadgeCheck,
    completed: false
  }
]

export function FormalityRoute() {
  const [steps, setSteps] = useState<Step[]>(initialSteps)
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  const toggleStep = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ))
  }

  const toggleExpand = (stepId: string) => {
    setExpandedStep(prev => prev === stepId ? null : stepId)
  }

  const completedCount = steps.filter(s => s.completed).length
  const progress = (completedCount / steps.length) * 100

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            Ruta a la Formalidad
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {completedCount} de {steps.length} completados
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-[oklch(0.55_0.22_280)] to-[oklch(0.6_0.18_250)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isExpanded = expandedStep === step.id
          const isLast = index === steps.length - 1
          
          return (
            <div key={step.id} className="relative">
              {/* Connection line */}
              {!isLast && (
                <div 
                  className={cn(
                    'absolute left-[19px] top-[40px] h-[calc(100%-24px)] w-0.5',
                    step.completed ? 'bg-[oklch(0.6_0.18_250)]' : 'bg-border'
                  )}
                />
              )}
              
              <div 
                className={cn(
                  'relative rounded-lg border p-3 transition-colors',
                  step.completed 
                    ? 'border-[oklch(0.6_0.18_250)]/30 bg-[oklch(0.6_0.18_250)]/5' 
                    : 'border-border bg-secondary/30 hover:bg-secondary/50'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Status icon */}
                  <button
                    onClick={() => toggleStep(step.id)}
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                      step.completed 
                        ? 'bg-[oklch(0.6_0.18_250)] text-white' 
                        : 'bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                    )}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className={cn(
                          'h-4 w-4',
                          step.completed ? 'text-[oklch(0.6_0.18_250)]' : 'text-primary'
                        )} />
                        <h4 className={cn(
                          'font-medium',
                          step.completed ? 'text-[oklch(0.6_0.18_250)]' : 'text-foreground'
                        )}>
                          {step.title}
                        </h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(step.id)}
                        className="h-7 px-2 text-muted-foreground"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                    
                    {/* Expanded details */}
                    {isExpanded && (
                      <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
