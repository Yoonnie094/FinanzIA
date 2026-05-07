import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/dashboard/settings-form'
import type { Business } from '@/lib/types'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Administra tu negocio y preferencias de cuenta
        </p>
      </div>
      <SettingsForm user={user} business={business as Business | null} />
    </div>
  )
}
