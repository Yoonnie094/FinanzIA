import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/stats-card'
import { SavingsCard } from '@/components/dashboard/savings-card'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { BusinessHealth } from '@/components/dashboard/business-health'
import { FormalityRoute } from '@/components/dashboard/formality-route'
import { AccountantModule } from '@/components/dashboard/accountant-module'
import { OnboardingTutorial } from '@/components/dashboard/onboarding-tutorial'
import { FinancialGoals } from '@/components/dashboard/financial-goals'
import { Wallet, TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import { Suspense } from 'react'
import { AnimatedGrid } from '@/components/dashboard/animated-grid'
import { getCategoryTheme, cn } from '@/lib/utils'
import { DashboardProvider } from '@/components/dashboard/dashboard-context'
import dynamic from 'next/dynamic'

const ExpenseChart = dynamic(() => import('@/components/dashboard/expense-chart').then(mod => mod.ExpenseChart), {
  loading: () => <div className="h-72 animate-pulse rounded-2xl bg-muted" />
})

const TrendChart = dynamic(() => import('@/components/dashboard/trend-chart').then(mod => mod.TrendChart), {
  loading: () => <div className="h-72 animate-pulse rounded-2xl bg-muted" />
})

async function getDashboardData(userId: string) {
  const supabase = await createClient()
  
  // Obtener transacciones y resumen RPC en paralelo
  const [recentTransactionsResult, summaryDataResult] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10),
    supabase
      .rpc('get_dashboard_summary', { p_user_id: userId })
  ])

  const recentTransactions = recentTransactionsResult.data
  const summaryData = summaryDataResult.data
  const rpcError = summaryDataResult.error

  if (rpcError || !summaryData) {
    console.error('Error fetching summary RPC:', rpcError)
    // Fallback en caso de que la RPC no haya sido creada en Supabase aún
    return {
      transactions: recentTransactions || [],
      summary: { balance: 0, monthlyIncome: 0, monthlyExpenses: 0 },
      categoryBreakdown: [],
      monthlyTrend: [],
      isNewUser: !recentTransactions || recentTransactions.length === 0
    }
  }

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  
  // Formatear datos de la RPC para los componentes UI
  const totalExpense = summaryData.categoryBreakdown.reduce((sum: number, c: any) => sum + Number(c.amount), 0)
  const categoryBreakdown = summaryData.categoryBreakdown.map((c: any) => ({
    category: c.category,
    amount: Number(c.amount),
    percentage: totalExpense > 0 ? Math.round((Number(c.amount) / totalExpense) * 100) : 0,
    fill: ''
  }))

  const monthlyTrend = summaryData.monthlyTrend.map((t: any) => ({
    month: monthNames[Number(t.month_index) - 1] || 'Unk',
    income: Number(t.income),
    expenses: Number(t.expenses)
  }))

  return {
    transactions: recentTransactions || [],
    summary: {
      balance: Number(summaryData.balance),
      monthlyIncome: Number(summaryData.monthlyIncome),
      monthlyExpenses: Number(summaryData.monthlyExpenses)
    },
    categoryBreakdown,
    monthlyTrend,
    isNewUser: !recentTransactions || recentTransactions.length === 0
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Paralelizar la obtención de datos financieros y de negocio
  const [dataResult, businessResult] = await Promise.all([
    getDashboardData(user.id),
    supabase
      .from('businesses')
      .select('category')
      .eq('user_id', user.id)
      .single()
  ])

  const { transactions, summary, categoryBreakdown, monthlyTrend, isNewUser } = dataResult
  const business = businessResult.data
  const themeClass = getCategoryTheme(business?.category)

  if (isNewUser) {
    return (
      <div className={cn("mx-auto max-w-7xl px-4 py-12 md:px-6 min-h-screen", themeClass)}>
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">
            Bienvenido a <span className="text-gradient">FinanzIA</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            La inteligencia artificial que transformará la gestión de tu negocio.
          </p>
        </div>
        <OnboardingTutorial />
      </div>
    )
  }

  const refreshKey = new Date().getTime().toString()

  return (
    <DashboardProvider refreshKey={refreshKey}>
      <div className={cn("mx-auto max-w-7xl px-4 py-8 md:px-6 min-h-screen transition-colors duration-1000", themeClass)}>
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                {business?.category || 'Inteligencia'} Activa
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Panel de <span className="text-gradient">Control</span>
            </h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              Análisis financiero en tiempo real para tu negocio
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border border-border p-3 rounded-2xl flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Estado de Suscripción</p>
                <p className="text-xs font-bold text-success">Plan Premium</p>
             </div>
             <div className="h-8 w-[1px] bg-border" />
             <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent animate-slow-spin" />
          </div>
        </div>

        <AnimatedGrid className="space-y-8">
          {/* Stats Cards */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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
            <StatsCard
              title="Metas Activas"
              value="Activo"
              subtitle="IA monitoreando"
              icon={Sparkles}
              variant="default"
            />
          </div>

          {/* Business Health */}
          <div>
            <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-muted" />}>
              <BusinessHealth 
                monthlyIncome={summary.monthlyIncome} 
                monthlyExpenses={summary.monthlyExpenses} 
              />
            </Suspense>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-muted" />}>
              <ExpenseChart data={categoryBreakdown} />
            </Suspense>
            <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-muted" />}>
              <TrendChart data={monthlyTrend} />
            </Suspense>
          </div>

          {/* Recent Transactions and Accountant Module */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
               <FinancialGoals />
            </div>
            <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-muted lg:col-span-1" />}>
              <RecentTransactions transactions={transactions} />
            </Suspense>
            <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-muted lg:col-span-1" />}>
              <AccountantModule 
                monthlyIncome={summary.monthlyIncome}
                monthlyExpenses={summary.monthlyExpenses}
                totalTransactions={transactions.length}
                transactions={transactions}
              />
            </Suspense>
          </div>

          {/* Formality Route */}
          <FormalityRoute />
        </AnimatedGrid>
      </div>
    </DashboardProvider>
  )
}

