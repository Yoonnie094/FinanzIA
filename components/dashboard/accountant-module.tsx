'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calculator, 
  Lightbulb, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/lib/types'

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

function getAITips(income: number, expenses: number, transactions: number): Tip[] {
  const tips: Tip[] = []
  
  if (income > 1000000) {
    tips.push({
      id: 'high-income',
      title: 'Considera asesor tributario',
      description: 'Con ingresos sobre $1.000.000 mensuales, un contador puede ayudarte a optimizar tu carga tributaria.',
      type: 'info'
    })
  }
  
  if (income > 2500000) {
    tips.push({
      id: 'very-high-income',
      title: 'Evaluación de régimen tributario',
      description: 'Tus ventas sugieren que podrías beneficiarte del régimen Pro Pyme. Consulta con un contador.',
      type: 'warning'
    })
  }
  
  const expenseRatio = income > 0 ? (expenses / income) * 100 : 0
  if (expenseRatio > 70) {
    tips.push({
      id: 'high-expenses',
      title: 'Revisa tus costos',
      description: 'Tus gastos representan más del 70% de tus ingresos. Considera revisar proveedores o precios.',
      type: 'warning'
    })
  }
  
  if (transactions > 50) {
    tips.push({
      id: 'many-transactions',
      title: 'Sistematiza tu contabilidad',
      description: 'Con alto volumen de transacciones, considera un software de facturación electrónica.',
      type: 'info'
    })
  }
  
  if (tips.length === 0) {
    tips.push({
      id: 'good-standing',
      title: 'Buen manejo financiero',
      description: 'Tus finanzas se ven saludables. Sigue registrando todos tus movimientos.',
      type: 'success'
    })
  }
  
  return tips.slice(0, 3)
}

export function AccountantModule({ monthlyIncome, monthlyExpenses, totalTransactions, transactions }: AccountantModuleProps) {
  const tips = getAITips(monthlyIncome, monthlyExpenses, totalTransactions)

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
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Calculator className="h-4 w-4 text-primary" />
          Módulo Contador
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Monthly Summary */}
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-success/10 p-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Resumen Mensual</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Ingresos</p>
              <p className="text-sm font-bold text-success">{formatCurrency(monthlyIncome)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gastos</p>
              <p className="text-sm font-bold text-accent">{formatCurrency(monthlyExpenses)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Utilidad</p>
              <p className={cn(
                'text-sm font-bold',
                monthlyIncome - monthlyExpenses >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {formatCurrency(monthlyIncome - monthlyExpenses)}
              </p>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <Button 
          onClick={handleExport}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar Datos para Contador
        </Button>

        {/* AI Tips */}
        <div className="space-y-2">
          <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Lightbulb className="h-4 w-4 text-primary" />
            Consejos de la IA
          </h4>
          {tips.map((tip) => (
            <div 
              key={tip.id}
              className={cn(
                'rounded-lg p-3 text-sm',
                tip.type === 'success' && 'bg-success/10 border border-success/20',
                tip.type === 'warning' && 'bg-warning/10 border border-warning/20',
                tip.type === 'info' && 'bg-primary/10 border border-primary/20'
              )}
            >
              <div className="flex items-start gap-2">
                {tip.type === 'success' && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />}
                {tip.type === 'warning' && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />}
                {tip.type === 'info' && <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
                <div>
                  <p className="font-medium text-foreground">{tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tip.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
