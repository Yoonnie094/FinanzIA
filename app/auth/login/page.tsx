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
import { Wallet, Loader2, CheckCircle, ShieldCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

type PageMode = 'login' | 'mfa'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [factorId, setFactorId] = useState<string | null>(null)
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      // Manejar MFA Requerido
      if (error && error.message.includes('mfa')) {
        // En Supabase v2, si MFA es obligatorio, signInWithPassword podría devolver un error específico
        // o podríamos necesitar verificar el nivel de autenticación.
        // Pero usualmente Supabase devuelve un error que indica que se requiere un segundo factor.
      }

      if (error) throw error

      // Verificar si se requiere un segundo factor (MFA)
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
      if (factorsError) throw factorsError

      const verifiedFactor = factors.all.find(f => f.status === 'verified')
      if (verifiedFactor) {
        setFactorId(verifiedFactor.id)
        setMode('mfa')
        setIsLoading(false)
        return
      }

      await completeLogin(supabase)
    } catch (error: any) {
      setError(error.message || 'Ocurrió un error al iniciar sesión')
      setIsLoading(false)
    }
  }

  const handleMFAVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!factorId || mfaCode.length !== 6) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: mfaCode
      })
      if (verifyError) throw verifyError

      await completeLogin(supabase)
    } catch (error: any) {
      setError('Código inválido o expirado')
      setIsLoading(false)
    }
  }

  const completeLogin = async (supabase: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single()

      router.push(business ? '/dashboard' : '/onboarding/business')
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
                  Ingresa tus credenciales para acceder
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs text-primary hover:underline underline-offset-4"
                        >
                          ¿Olvidaste tu contraseña?
                        </Link>
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
                </form>


                <div className="mt-4 text-center text-sm text-muted-foreground">
                  ¿No tienes cuenta?{' '}
                  <Link
                    href="/auth/sign-up"
                    className="text-primary font-medium hover:underline underline-offset-4"
                  >
                    Regístrate
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ========== MFA MODE ========== */}
          {mode === 'mfa' && (
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl text-foreground">Verificación de Seguridad</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Ingresa el código de 6 dígitos de tu aplicación de autenticación.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMFAVerify}>
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={mfaCode}
                        onChange={setMfaCode}
                        onComplete={handleMFAVerify}
                        render={({ slots }) => (
                          <InputOTPGroup className="gap-2">
                            {slots.map((slot, index) => (
                              <InputOTPSlot key={index} index={index} {...slot} className="w-10 h-12 text-lg border-2" />
                            ))}
                          </InputOTPGroup>
                        )}
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive text-center">{error}</p>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90" 
                      disabled={isLoading || mfaCode.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verificando...
                        </>
                      ) : 'Verificar Código'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setMfaCode(''); setFactorId(null); setError(null) }}
                      className="text-center text-sm text-muted-foreground hover:text-foreground"
                    >
                      ← Volver al inicio de sesión
                    </button>
                  </div>
                </form>
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

