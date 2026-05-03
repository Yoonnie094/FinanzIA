'use client'

import { useState, useEffect } from 'react'
import { StatsCard } from '@/components/dashboard/stats-card'
import { PiggyBank, Settings2 } from 'lucide-react'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'

interface SavingsCardProps {
  totalBalance: number
}

export function SavingsCard({ totalBalance }: SavingsCardProps) {
  const [percentage, setPercentage] = useState(10)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('savingsPercentage')
    if (saved) {
      setPercentage(Number(saved))
    }
  }, [])

  const handlePercentageChange = (value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value))
    setPercentage(clampedValue)
    localStorage.setItem('savingsPercentage', clampedValue.toString())
  }

  // Si hay deuda (balance negativo), el ahorro es 0.
  // Si el balance es positivo, calculamos el porcentaje.
  const savingsAmount = totalBalance > 0 
    ? totalBalance * (percentage / 100) 
    : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Prevenir hydration mismatch
  if (!mounted) {
    return (
      <StatsCard
        title="Ahorro Objetivo"
        value={formatCurrency(0)}
        icon={PiggyBank}
        variant="savings"
      />
    )
  }

  const SettingsAction = (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white border-0">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Configurar ahorro</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Objetivo de Ahorro</h4>
            <p className="text-sm text-muted-foreground">
              Configura que porcentaje de tu balance total ({formatCurrency(totalBalance)}) deseas destinar al ahorro.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="percentage">Porcentaje</Label>
              <span className="text-sm font-bold text-primary">{percentage}%</span>
            </div>
            <Slider
              id="percentage"
              max={100}
              step={1}
              value={[percentage]}
              onValueChange={(vals) => handlePercentageChange(vals[0])}
            />
            <div className="grid grid-cols-2 items-center gap-4">
              <Input
                type="number"
                min="0"
                max="100"
                value={percentage === 0 ? '' : percentage}
                onChange={(e) => {
                  const val = e.target.value
                  handlePercentageChange(val === '' ? 0 : Number(val))
                }}
                onFocus={(e) => e.target.select()}
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )

  return (
    <StatsCard
      title="Ahorro Objetivo"
      value={formatCurrency(savingsAmount)}
      subtitle={`Basado en el ${percentage}% de tu balance`}
      icon={PiggyBank}
      variant="savings"
      action={SettingsAction}
    />
  )
}
