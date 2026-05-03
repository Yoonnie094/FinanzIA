import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/stats-card'
import { SavingsCard } from '@/components/dashboard/savings-card'
import { ExpenseChart } from '@/components/dashboard/expense-chart'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { BusinessHealth } from '@/components/dashboard/business-health'
import { FormalityRoute } from '@/components/dashboard/formality-route'
import { AccountantModule } from '@/components/dashboard/accountant-module'
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import type { Transaction, CategoryBreakdown, MonthlyTrend } from '@/lib/types'

async function getTransactions(): Promise<Transaction[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data || []
}

function calculateSummary(transactions: Transaction[]) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const thisMonthTransactions = transactions.filter((t) => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const monthlyIncome = thisMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const monthlyExpenses = thisMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

  const balance = totalIncome - totalExpenses

  return {
    balance,
    monthlyIncome,
    monthlyExpenses,
  }
}

function getCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const thisMonthExpenses = transactions.filter((t) => {
    const date = new Date(t.date)
    return (
      t.type === 'expense' &&
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    )
  })

  const categoryTotals: Record<string, number> = {}
  thisMonthExpenses.forEach((t) => {
    const category = t.category || 'Otros'
    categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(Number(t.amount))
  })

  const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)

  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      fill: '',
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
}

function getMonthlyTrend(transactions: Transaction[]): MonthlyTrend[] {
  const months: Record<string, { income: number; expenses: number }> = {}
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  transactions.forEach((t) => {
    const date = new Date(t.date)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    
    if (!months[key]) {
      months[key] = { income: 0, expenses: 0 }
    }

    if (t.type === 'income') {
      months[key].income += Number(t.amount)
    } else {
      months[key].expenses += Math.abs(Number(t.amount))
    }
  })

  const sortedKeys = Object.keys(months).sort()
  return sortedKeys.slice(-6).map((key) => {
    const [, monthIndex] = key.split('-')
    return {
      month: monthNames[parseInt(monthIndex)],
      income: months[key].income,
      expenses: months[key].expenses,
    }
  })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value)
}

export default async function DashboardPage() {
  const transactions = await getTransactions()
  const summary = calculateSummary(transactions)
  const categoryBreakdown = getCategoryBreakdown(transactions)
  const monthlyTrend = getMonthlyTrend(transactions)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Panel de Control</h1>
        <p className="text-sm text-muted-foreground">
          Resumen de tus finanzas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Balance Total"
          value={formatCurrency(summary.balance)}
          icon={Wallet}
          variant="default"
        />
        <StatsCard
          title="Ingresos del Mes"
          value={formatCurrency(summary.monthlyIncome)}
          icon={TrendingUp}
          variant="income"
        />
        <StatsCard
          title="Gastos del Mes"
          value={formatCurrency(summary.monthlyExpenses)}
          icon={TrendingDown}
          variant="expense"
        />
        <SavingsCard totalBalance={summary.balance} />
      </div>

      {/* Business Health */}
      <div className="mb-8">
        <BusinessHealth 
          monthlyIncome={summary.monthlyIncome} 
          monthlyExpenses={summary.monthlyExpenses} 
        />
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-5 md:grid-cols-2">
        <ExpenseChart data={categoryBreakdown} />
        <TrendChart data={monthlyTrend} />
      </div>

      {/* Recent Transactions and Accountant Module */}
      <div className="mb-8 grid gap-5 lg:grid-cols-2">
        <RecentTransactions transactions={transactions} />
        <AccountantModule 
          monthlyIncome={summary.monthlyIncome}
          monthlyExpenses={summary.monthlyExpenses}
          totalTransactions={transactions.length}
          transactions={transactions}
        />
      </div>

      {/* Formality Route */}
      <FormalityRoute />
    </div>
  )
}
