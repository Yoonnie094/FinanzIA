'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { CategoryBreakdown } from '@/lib/types'

interface ExpenseChartProps {
  data: CategoryBreakdown[]
}

// CSS var colors legibles por Recharts (valores CSS calculados)
const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

// Colores fallback para Recharts (que no puede leer CSS vars directamente)
const CHART_COLORS_FALLBACK = [
  'oklch(0.55 0.22 280)',
  'oklch(0.6 0.18 250)',
  'oklch(0.7 0.18 340)',
  'oklch(0.65 0.2 310)',
  'oklch(0.5 0.15 220)',
]

export function ExpenseChart({ data }: ExpenseChartProps) {
  const formattedData = data.map((item, index) => ({
    ...item,
    fill: CHART_COLORS_FALLBACK[index % CHART_COLORS_FALLBACK.length],
    cssColor: CHART_COLORS[index % CHART_COLORS.length],
  }))

  const formatCurrency = (value: number) => {
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
          <CardTitle className="text-base font-semibold text-foreground">Gastos por Categoría</CardTitle>
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
        <CardTitle className="text-base font-semibold text-foreground">Gastos por Categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="h-[180px] w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="amount"
                  strokeWidth={0}
                >
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Monto']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    color: 'hsl(var(--foreground))',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  // Activa tooltips en eventos táctiles para móvil
                  trigger="hover"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 md:w-1/2 md:flex-col md:gap-3">
            {formattedData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm text-foreground">
                  {item.category}: <span className="text-muted-foreground">{item.percentage}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
