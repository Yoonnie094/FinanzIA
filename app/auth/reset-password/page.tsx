'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Wallet, Loader2, Eye, EyeOff } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Supabase maneja automáticamente el token desde la URL hash
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true)
    })
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center justify-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">FinanzIA</span>
          </Link>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">
                {success ? '¡Contraseña actualizada!' : 'Nueva contraseña'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {success
                  ? 'Redirigiendo a tu dashboard...'
                  : 'Ingresa tu nueva contraseña para continuar.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-success" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Tu contraseña fue actualizada correctamente. Redirigiendo...
                  </p>
                </div>
              ) : !validSession ? (
                <div className="text-center py-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    El enlace de recuperación es inválido o expiró.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/login">Solicitar nuevo enlace</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleReset}>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new-password" className="text-foreground">Nueva contraseña</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 8 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          minLength={8}
                          required
                          className="bg-secondary/50 border-border pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password" className="text-foreground">Confirmar contraseña</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Repite tu contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-secondary/50 border-border"
                      />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button
                      type="submit"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Actualizando...
                        </>
                      ) : 'Actualizar contraseña'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
