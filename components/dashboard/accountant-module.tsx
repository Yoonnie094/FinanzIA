'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calculator, 
  Lightbulb, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

import { useDashboard } from '@/components/dashboard/dashboard-context'

interface AccountantModuleProps {
  monthlyIncome: number
  monthlyExpenses: number
  totalTransactions: number
  transactions: Transaction[]
}

interface Tip {
  id: string
  title: string
  description: string
  type: 'info' | 'warning' | 'success'
}

export function AccountantModule({ monthlyIncome, monthlyExpenses, totalTransactions, transactions }: AccountantModuleProps) {
  const { insights: aiAnalysis, loading } = useDashboard()
  const tips = aiAnalysis?.tips || []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleExport = () => {
    if (!transactions || transactions.length === 0) {
      alert('No hay transacciones para exportar.')
      return
    }

    const headers = ['Fecha', 'Concepto', 'Categoría', 'Tipo', 'Monto']
    
    const rows = transactions.map(t => {
      const date = new Date(t.date).toLocaleDateString('es-CL')
      const concept = `"${t.concept.replace(/"/g, '""')}"`
      const category = `"${t.category || 'Otros'}"`
      const type = t.type === 'income' ? 'Ingreso' : 'Gasto'
      const amount = t.type === 'expense' ? -Math.abs(Number(t.amount)) : Math.abs(Number(t.amount))
      return [date, concept, category, type, amount].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `finanzas_contador_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-border bg-card/50 backdrop-blur-md shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Calculator className="h-4 w-4 text-primary" />
            Módulo Contador AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 via-background to-success/10 p-4 border border-primary/5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Resumen de Periodo</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Ingresos</p>
                <p className="text-xs font-bold text-success">{formatCurrency(monthlyIncome)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Gastos</p>
                <p className="text-xs font-bold text-accent">{formatCurrency(monthlyExpenses)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Utilidad</p>
                <p className={cn(
                  'text-xs font-bold',
                  monthlyIncome - monthlyExpenses >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {formatCurrency(monthlyIncome - monthlyExpenses)}
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleExport}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar para Contador
          </Button>

          <div className="space-y-3 pt-2">
            <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              Recomendaciones de IA
            </h4>
            
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : (
                  tips.map((tip, index) => (
                    <motion.div 
                      key={tip.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'rounded-xl p-3 text-sm border transition-colors',
                        tip.type === 'success' && 'bg-success/5 border-success/20',
                        tip.type === 'warning' && 'bg-warning/5 border-warning/20',
                        tip.type === 'info' && 'bg-primary/5 border-primary/20'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'mt-0.5 rounded-lg p-1.5',
                          tip.type === 'success' && 'bg-success/20 text-success',
                          tip.type === 'warning' && 'bg-warning/20 text-warning',
                          tip.type === 'info' && 'bg-primary/20 text-primary'
                        )}>
                          {tip.type === 'success' && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {tip.type === 'warning' && <AlertCircle className="h-3.5 w-3.5" />}
                          {tip.type === 'info' && <TrendingUp className="h-3.5 w-3.5" />}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-xs">{tip.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{tip.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

