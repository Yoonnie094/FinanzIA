import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/dashboard/settings-form'
import { MFAManagement } from '@/components/dashboard/mfa-management'
import { PasswordSettings } from '@/components/dashboard/password-settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Administra tu negocio y preferencias de seguridad
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1 border">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <SettingsForm user={user} business={business as Business | null} />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6">
            <PasswordSettings />
            <MFAManagement />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
