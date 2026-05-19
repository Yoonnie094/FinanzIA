'use client'

import { useDashboard } from '@/components/dashboard/dashboard-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, TrendingUp, TrendingDown, AlertTriangle, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface BusinessHealthProps {
  monthlyIncome: number
  monthlyExpenses: number
}

type HealthStatus = 'excellent' | 'good' | 'warning' | 'critical'

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
  const { insights: aiAnalysis, loading } = useDashboard()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const health = aiAnalysis?.health || { 
    status: (monthlyIncome - monthlyExpenses >= 0 ? 'good' : 'critical') as HealthStatus,
    percentage: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0,
    message: 'Calculando salud financiera...'
  }
  
  const config = statusConfig[health.status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-border bg-card/50 backdrop-blur-md shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Sparkles className="h-20 w-20 text-primary" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Activity className="h-4 w-4 text-primary" />
            Salud del Negocio AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner', config.bg)}>
                  <Icon className={cn('h-6 w-6', config.color)} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={cn('text-2xl font-black tracking-tight', config.color)}>
                      {health.percentage > 0 ? '+' : ''}{health.percentage.toFixed(1)}%
                    </p>
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">{health.message}</p>
                </div>
              </div>
            </div>
            <div className="md:text-right bg-secondary/30 p-3 rounded-xl">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Utilidad Proyectada</p>
              <p className={cn('text-xl font-bold', monthlyIncome - monthlyExpenses >= 0 ? 'text-success' : 'text-destructive')}>
                {formatCurrency(monthlyIncome - monthlyExpenses)}
              </p>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Eficiencia</span>
                <span>{Math.abs(health.percentage).toFixed(0)}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-secondary overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Math.max(health.percentage + 50, 5), 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn('h-full rounded-full shadow-sm', config.bar)}
                />
              </div>
            </div>
            
            {aiAnalysis?.projection && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-primary/5 border border-primary/10 rounded-lg p-3"
              >
                <p className="text-xs italic text-primary/80">
                  <Sparkles className="h-3 w-3 inline mr-1 mb-0.5" />
                  {aiAnalysis.projection}
                </p>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

