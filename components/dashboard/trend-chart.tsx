'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { MonthlyTrend } from '@/lib/types'

interface TrendChartProps {
  data: MonthlyTrend[]
}

const INCOME_COLOR = 'oklch(0.6 0.18 250)'   // success
const EXPENSE_COLOR = 'oklch(0.7 0.18 340)'  // accent

export function TrendChart({ data }: TrendChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  const fullFormatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (data.length === 0) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Tendencia Mensual</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Tendencia Mensual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.6 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.6 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  fullFormatCurrency(value),
                  name === 'income' ? 'Ingresos' : 'Gastos',
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  color: 'hsl(var(--foreground))',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                cursor={{ fill: 'hsl(var(--secondary))' }}
              />
              <Bar
                dataKey="income"
                fill={INCOME_COLOR}
                radius={[6, 6, 0, 0]}
                name="Ingresos"
              />
              <Bar
                dataKey="expenses"
                fill={EXPENSE_COLOR}
                radius={[6, 6, 0, 0]}
                name="Gastos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: INCOME_COLOR }} />
            <span className="text-sm text-muted-foreground">Ingresos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: EXPENSE_COLOR }} />
            <span className="text-sm text-muted-foreground">Gastos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
