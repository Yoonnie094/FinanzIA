import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'income' | 'expense' | 'savings'
  action?: React.ReactNode
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  action,
}: StatsCardProps) {
  const gradientStyles = {
    default: 'bg-gradient-to-br from-[oklch(0.55_0.22_280)] to-[oklch(0.5_0.18_250)]',
    income: 'bg-gradient-to-br from-[oklch(0.6_0.18_250)] to-[oklch(0.55_0.22_280)]',
    expense: 'bg-gradient-to-br from-[oklch(0.7_0.18_340)] to-[oklch(0.65_0.2_310)]',
    savings: 'bg-gradient-to-br from-[oklch(0.55_0.22_280)] to-[oklch(0.7_0.18_340)]',
  }

  const iconStyles = {
    default: 'bg-white/20 text-white',
    income: 'bg-white/20 text-white',
    expense: 'bg-white/20 text-white',
    savings: 'bg-white/20 text-white',
  }

  return (
    <Card className={cn(
      'border-0 shadow-lg shadow-primary/5 overflow-hidden',
      gradientStyles[variant]
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-white md:text-3xl">{value}</p>
            {subtitle && (
              <p className="text-xs text-white/70">{subtitle}</p>
            )}
            {trend && (
              <p className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-white/90' : 'text-white/70'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}% vs mes anterior
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {action && <div>{action}</div>}
            <div className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl',
              iconStyles[variant]
            )}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
