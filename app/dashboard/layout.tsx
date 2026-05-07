import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { FloatingChat } from '@/components/dashboard/floating-chat'
import { StockAlertNotifier } from '@/components/dashboard/stock-alert-notifier'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Si no tiene negocio, completar onboarding
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!business) {
    redirect('/onboarding/business')
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />
      <main className="pb-20 md:pb-6">
        {children}
      </main>
      <FloatingChat />
      <StockAlertNotifier />
    </div>
  )
}
