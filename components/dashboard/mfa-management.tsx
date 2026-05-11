'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Shield, ShieldCheck, ShieldAlert, Loader2, QrCode, Copy, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'

export function MFAManagement() {
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [factors, setFactors] = useState<any[]>([])

  const supabase = createClient()

  const fetchFactors = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (error) {
      console.error('Error fetching factors:', error)
      return
    }
    setFactors(data.all)
    setIsEnrolled(data.all.some(f => f.status === 'verified'))
  }, [supabase.auth.mfa])

  useEffect(() => {
    fetchFactors()
  }, [fetchFactors])

  const onEnroll = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      })
      if (error) throw error

      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
    } catch (error: any) {
      toast.error('No se pudo iniciar el enrolamiento: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const onVerify = async () => {
    if (!factorId) return
    setIsLoading(true)
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      })
      if (verifyError) throw verifyError

      toast.success('¡MFA activado correctamente!')
      setFactorId(null)
      setQrCode(null)
      setSecret(null)
      setVerifyCode('')
      fetchFactors()
    } catch (error: any) {
      toast.error('Código inválido: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const onUnenroll = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar la autenticación de dos factores?')) return
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: id })
      if (error) throw error
      toast.success('MFA desactivado')
      fetchFactors()
    } catch (error: any) {
      toast.error('Error al desactivar: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          {isEnrolled ? (
            <ShieldCheck className="h-5 w-5 text-success" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-warning" />
          )}
          <CardTitle className="text-xl">Autenticación de Dos Factores (2FA)</CardTitle>
        </div>
        <CardDescription>
          Añade una capa extra de seguridad a tu cuenta usando una aplicación de autenticación (Google Authenticator, Authy, etc).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEnrolled ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-success/10 p-4 border border-success/20">
              <p className="text-sm text-success font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Tu cuenta está protegida con 2FA.
              </p>
            </div>
            {factors.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 border rounded-lg bg-secondary/30">
                <div>
                  <p className="text-sm font-bold">{f.friendly_name || 'App de Autenticación'}</p>
                  <p className="text-xs text-muted-foreground">Activado el {new Date(f.created_at).toLocaleDateString()}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => onUnenroll(f.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : !qrCode ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <Shield className="h-12 w-12 text-muted-foreground opacity-20" />
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Actualmente solo usas tu contraseña para ingresar. Te recomendamos activar 2FA.
            </p>
            <Button onClick={onEnroll} disabled={isLoading} className="bg-primary text-primary-foreground">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Configurar 2FA
            </Button>
          </div>
        ) : (
          <div className="space-y-6 flex flex-col items-center">
            <div className="text-center space-y-2">
              <p className="text-sm font-bold">1. Escanea este código QR</p>
              <p className="text-xs text-muted-foreground">Usa tu aplicación de autenticación favorita</p>
            </div>
            
            <div className="p-4 bg-white rounded-xl shadow-inner">
              <QRCodeSVG value={qrCode} size={180} />
            </div>

            <div className="w-full space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase">O ingresa el código manualmente:</p>
              <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg border">
                <code className="flex-1 text-xs font-mono break-all">{secret}</code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => {
                    navigator.clipboard.writeText(secret!)
                    toast.success('Copiado al portapapeles')
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="w-full space-y-4 pt-4 border-t">
              <div className="text-center space-y-2">
                <p className="text-sm font-bold">2. Verifica el código</p>
                <p className="text-xs text-muted-foreground">Ingresa el código de 6 dígitos que aparece en tu app</p>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verifyCode}
                  onChange={setVerifyCode}
                  render={({ slots }) => (
                    <InputOTPGroup className="gap-2">
                      {slots.map((slot, index) => (
                        <InputOTPSlot key={index} index={index} {...slot} className="w-10 h-12 text-lg border-2" />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => { setQrCode(null); setVerifyCode('') }}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-accent text-accent-foreground"
                  disabled={verifyCode.length !== 6 || isLoading}
                  onClick={onVerify}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verificar y Activar
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
