'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BusinessHealthProps {
  monthlyIncome: number
  monthlyExpenses: number
}

type HealthStatus = 'excellent' | 'good' | 'warning' | 'critical'

function getHealthStatus(income: number, expenses: number): { status: HealthStatus; percentage: number; message: string } {
  if (income === 0 && expenses === 0) {
    return { status: 'warning', percentage: 0, message: 'Sin movimientos este mes' }
  }
  
  const profit = income - expenses
  const margin = income > 0 ? (profit / income) * 100 : 0
  
  if (margin >= 30) {
    return { status: 'excellent', percentage: margin, message: 'Excelente rentabilidad' }
  } else if (margin >= 15) {
    return { status: 'good', percentage: margin, message: 'Buena rentabilidad' }
  } else if (margin >= 0) {
    return { status: 'warning', percentage: margin, message: 'Rentabilidad ajustada' }
  } else {
    return { status: 'critical', percentage: margin, message: 'Operando con pérdidas' }
  }
}

const statusConfig: Record<HealthStatus, { color: string; bg: string; bar: string; icon: typeof Activity }> = {
  excellent: { 
    color: 'text-success', 
    bg: 'bg-success/10',
    bar: 'bg-success',
    icon: TrendingUp 
  },
  good: { 
    color: 'text-primary', 
    bg: 'bg-primary/10',
    bar: 'bg-primary',
    icon: TrendingUp 
  },
  warning: { 
    color: 'text-warning', 
    bg: 'bg-warning/10',
    bar: 'bg-warning',
    icon: AlertTriangle 
  },
  critical: { 
    color: 'text-destructive', 
    bg: 'bg-destructive/10',
    bar: 'bg-destructive',
    icon: TrendingDown 
  },
}

export function BusinessHealth({ monthlyIncome, monthlyExpenses }: BusinessHealthProps) {
  const { status, percentage, message } = getHealthStatus(monthlyIncome, monthlyExpenses)
  const config = statusConfig[status]
  const Icon = config.icon

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Activity className="h-4 w-4 text-primary" />
          Salud del Negocio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', config.bg)}>
                <Icon className={cn('h-5 w-5', config.color)} />
              </div>
              <div>
                <p className={cn('text-lg font-bold', config.color)}>
                  {percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">{message}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Utilidad del mes</p>
            <p className={cn('text-lg font-bold', monthlyIncome - monthlyExpenses >= 0 ? 'text-success' : 'text-destructive')}>
              {formatCurrency(monthlyIncome - monthlyExpenses)}
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Gastos: {formatCurrency(monthlyExpenses)}</span>
            <span>Ingresos: {formatCurrency(monthlyIncome)}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary">
            <div 
              className={cn('h-full rounded-full transition-all', config.bar)}
              style={{ width: `${Math.min(Math.max(percentage + 50, 0), 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
