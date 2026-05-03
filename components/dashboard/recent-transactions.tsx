'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Transaction } from '@/lib/types'
import { cn } from '@/lib/utils'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    if (!mounted) return ''
    // Parse date string as local date parts to avoid timezone issues
    const parts = dateStr.split('-')
    const day = parseInt(parts[2], 10)
    const monthIndex = parseInt(parts[1], 10) - 1
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${day} ${months[monthIndex]}`
  }

  if (transactions.length === 0) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Ultimos Movimientos</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] flex-col items-center justify-center gap-3">
          <p className="text-sm text-muted-foreground">Sin transacciones recientes</p>
          <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/dashboard/chat">
              Agregar con Chat IA
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Ultimos Movimientos</CardTitle>
        <Button asChild variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/90">
          <Link href="/dashboard/transactions" className="flex items-center gap-1">
            Ver todos
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.slice(0, 5).map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-xl bg-secondary/50 p-3 transition-colors hover:bg-secondary"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full',
                  transaction.type === 'income'
                    ? 'bg-[oklch(0.6_0.18_250)]/10 text-[oklch(0.6_0.18_250)]'
                    : 'bg-[oklch(0.7_0.18_340)]/10 text-[oklch(0.7_0.18_340)]'
                )}
              >
                {transaction.type === 'income' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{transaction.concept}</p>
                <p className="text-xs text-muted-foreground">
                  {transaction.category} - {formatDate(transaction.date)}
                </p>
              </div>
            </div>
            <p
              className={cn(
                'text-sm font-semibold',
                transaction.type === 'income' 
                  ? 'text-[oklch(0.6_0.18_250)]' 
                  : 'text-[oklch(0.7_0.18_340)]'
              )}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(Math.abs(transaction.amount))}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
