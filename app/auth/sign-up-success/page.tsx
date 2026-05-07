'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Wallet, Mail, ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function SignUpSuccessPage() {
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
          
          <Card className="border-border bg-card shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary animate-bounce" />
              </div>
              <CardTitle className="text-2xl text-foreground">¡Casi listo!</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Hemos enviado un enlace de confirmación a tu correo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-sm text-muted-foreground">
                Para activar tu cuenta y comenzar a usar la IA en tu negocio, haz clic en el botón dentro del email que te enviamos.
              </p>
              
              <div className="rounded-lg bg-secondary/50 p-4 text-xs text-muted-foreground">
                <p>¿No recibiste el correo? Revisa tu carpeta de <strong>Spam</strong> o espera un par de minutos.</p>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">
                  Volver al inicio de sesión
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <p className="text-center text-xs text-muted-foreground">
            Si tienes problemas, contacta a soporte@finanzia.com
          </p>
        </div>
      </div>
    </div>
  )
}
