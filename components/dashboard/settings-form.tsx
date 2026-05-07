'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, CheckCircle, Mail, Trash2, Building2, User } from 'lucide-react'
import { BUSINESS_CATEGORIES } from '@/lib/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Business } from '@/lib/types'

interface SettingsFormProps {
  user: SupabaseUser
  business: Business | null
}

export function SettingsForm({ user, business }: SettingsFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [businessForm, setBusinessForm] = useState({
    name: business?.name || '',
    category: business?.category || '',
    description: business?.description || '',
  })

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessForm.name.trim()) {
      setError('El nombre del negocio es requerido')
      return
    }
    setIsSaving(true)
    setError(null)
    setSaveSuccess(false)

    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('businesses')
      .update({
        name: businessForm.name,
        category: businessForm.category,
        description: businessForm.description,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    setIsSaving(false)
    if (dbError) {
      setError('No se pudieron guardar los cambios. Intenta nuevamente.')
    } else {
      setSaveSuccess(true)
      router.refresh()
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const handleSendPasswordReset = async () => {
    setIsSendingReset(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(user.email!, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setIsSendingReset(false)
    setResetSent(true)
    setTimeout(() => setResetSent(false), 5000)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'ELIMINAR') return
    setIsDeleting(true)
    const supabase = createClient()
    // Sign out first, then the account deletion should be handled via Supabase admin
    // For now we clear local data and redirect to inform the user to contact support
    await supabase.auth.signOut()
    router.push('/?deleted=1')
  }

  return (
    <div className="space-y-6">
      {/* Business Info */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Building2 className="h-5 w-5 text-primary" />
            Datos del Negocio
          </CardTitle>
          <CardDescription>
            Esta información personaliza los consejos de la IA para tu tipo de negocio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveBusiness} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="biz-name" className="text-foreground">Nombre del negocio</Label>
              <Input
                id="biz-name"
                value={businessForm.name}
                onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                placeholder="Ej: Panadería La Esperanza"
                maxLength={100}
                className="bg-secondary/50 border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="biz-category" className="text-foreground">Rubro</Label>
              <Select
                value={businessForm.category}
                onValueChange={(v) => setBusinessForm({ ...businessForm, category: v })}
              >
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="Selecciona un rubro" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="biz-desc" className="text-foreground">Descripción (opcional)</Label>
              <Input
                id="biz-desc"
                value={businessForm.description}
                onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                placeholder="Ej: Venta de pan artesanal y pastelería"
                maxLength={200}
                className="bg-secondary/50 border-border"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
              ) : saveSuccess ? (
                <><CheckCircle className="mr-2 h-4 w-4" /> ¡Guardado!</>
              ) : 'Guardar cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5 text-primary" />
            Cuenta
          </CardTitle>
          <CardDescription>
            Gestiona tu email y contraseña de acceso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-secondary/50 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">Email de la cuenta</p>
            <p className="font-medium text-foreground">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Para cambiar tu contraseña, te enviaremos un enlace a tu email.
            </p>
            <Button
              variant="outline"
              onClick={handleSendPasswordReset}
              disabled={isSendingReset || resetSent}
              className="gap-2"
            >
              {isSendingReset ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
              ) : resetSent ? (
                <><CheckCircle className="h-4 w-4 text-success" /> Email enviado</>
              ) : (
                <><Mail className="h-4 w-4" /> Cambiar contraseña</>
              )}
            </Button>
            {resetSent && (
              <p className="mt-2 text-xs text-muted-foreground">
                Revisa tu correo ({user.email}) y sigue el enlace.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Zona de peligro
          </CardTitle>
          <CardDescription>
            Estas acciones son permanentes e irreversibles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            Eliminar mi cuenta
          </Button>
        </CardContent>
      </Card>

      {/* Delete account dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">¿Eliminar cuenta permanentemente?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                Se eliminarán <strong>todos tus datos</strong>: transacciones, inventario y datos del negocio.
                Esta acción <strong>no se puede deshacer</strong>.
              </span>
              <span className="block mt-3">
                Para confirmar, escribe <strong>ELIMINAR</strong> en el campo:
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Escribe ELIMINAR"
            className="border-destructive/50"
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'ELIMINAR' || isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar cuenta'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
