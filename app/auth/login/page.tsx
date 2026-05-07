'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Wallet, Loader2, CheckCircle } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

type PageMode = 'login' | 'forgot'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<PageMode>('login')
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: business } = await supabase
          .from('businesses')
          .select('id')
          .eq('user_id', user.id)
          .single()

        router.push(business ? '/dashboard' : '/onboarding/business')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Ocurrió un error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Ingresa tu email para continuar')
      return
    }
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setResetSent(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'No se pudo enviar el email')
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

          {/* ========== LOGIN MODE ========== */}
          {mode === 'login' && (
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-foreground">Iniciar Sesión</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Ingresa tu email para acceder a tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-secondary/50 border-border"
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-foreground">Contraseña</Label>
                        <button
                          type="button"
                          onClick={() => { setMode('forgot'); setError(null) }}
                          className="text-xs text-primary hover:underline underline-offset-4"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-secondary/50 border-border"
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ingresando...
                        </>
                      ) : 'Ingresar'}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    ¿No tienes cuenta?{' '}
                    <Link
                      href="/auth/sign-up"
                      className="text-primary font-medium hover:underline underline-offset-4"
                    >
                      Regístrate
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* ========== FORGOT PASSWORD MODE ========== */}
          {mode === 'forgot' && (
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-foreground">
                  {resetSent ? '¡Email enviado!' : 'Recuperar contraseña'}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {resetSent
                    ? 'Revisa tu correo y sigue el enlace para crear una nueva contraseña.'
                    : 'Te enviaremos un enlace para restablecer tu contraseña.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resetSent ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                      <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      Enviamos el enlace a <strong>{email}</strong>
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => { setMode('login'); setResetSent(false) }}
                    >
                      Volver al inicio de sesión
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword}>
                    <div className="flex flex-col gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="reset-email" className="text-foreground">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-secondary/50 border-border"
                        />
                      </div>
                      {error && (
                        <p className="text-sm text-destructive">{error}</p>
                      )}
                      <Button
                        type="submit"
                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : 'Enviar enlace de recuperación'}
                      </Button>
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setError(null) }}
                        className="text-center text-sm text-muted-foreground hover:text-foreground"
                      >
                        ← Volver al inicio de sesión
                      </button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Gestiona tus finanzas con inteligencia artificial
          </p>
        </div>
      </div>
    </div>
  )
}
