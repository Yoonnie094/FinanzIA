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
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 280)" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'oklch(0.5 0.02 280)', fontSize: 12 }}
                axisLine={{ stroke: 'oklch(0.92 0.01 280)' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: 'oklch(0.5 0.02 280)', fontSize: 12 }}
                axisLine={{ stroke: 'oklch(0.92 0.01 280)' }}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  fullFormatCurrency(value),
                  name === 'income' ? 'Ingresos' : 'Gastos',
                ]}
                contentStyle={{
                  backgroundColor: 'oklch(1 0 0)',
                  border: '1px solid oklch(0.92 0.01 280)',
                  borderRadius: '12px',
                  color: 'oklch(0.2 0.02 280)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar
                dataKey="income"
                fill="oklch(0.6 0.18 250)"
                radius={[6, 6, 0, 0]}
                name="Ingresos"
              />
              <Bar
                dataKey="expenses"
                fill="oklch(0.7 0.18 340)"
                radius={[6, 6, 0, 0]}
                name="Gastos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'oklch(0.6 0.18 250)' }} />
            <span className="text-sm text-muted-foreground">Ingresos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'oklch(0.7 0.18 340)' }} />
            <span className="text-sm text-muted-foreground">Gastos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
