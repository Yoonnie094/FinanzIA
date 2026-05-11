'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Wallet, CheckCircle2, ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifiedPage() {
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    const redirect = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)

    return () => {
      clearInterval(timer)
      clearTimeout(redirect)
    }
  }, [router])

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center justify-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">FinanzIA</span>
          </Link>
          
          <Card className="border-border bg-card shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x" />
            <CardHeader className="text-center pt-8">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 border-4 border-success/20">
                <CheckCircle2 className="h-10 w-10 text-success animate-in zoom-in duration-500" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">¡Email verificado!</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Tu cuenta ha sido activada correctamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center pb-8">
              <p className="text-sm text-muted-foreground">
                Gracias por unirte a FinanzIA. Ahora tienes acceso completo a todas las herramientas de IA para potenciar tu negocio.
              </p>
              
              <div className="space-y-4">
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg">
                  <Link href="/dashboard">
                    Ir al Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Redirigiendo automáticamente en <span className="font-bold text-foreground">{countdown}</span> segundos...
                </p>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-center text-xs text-muted-foreground">
            FinanzIA &copy; 2026 - Inteligencia Artificial para Emprendedores
          </p>
        </div>
      </div>
    </div>
  )
}
