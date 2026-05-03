import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Wallet, Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 text-primary">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FinanzasAI</span>
          </div>
          <Card className="border-border/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                Gracias por registrarte
              </CardTitle>
              <CardDescription>
                Revisa tu email para confirmar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Te hemos enviado un email de confirmacion. Por favor revisa tu
                bandeja de entrada y haz clic en el enlace para activar tu
                cuenta.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Una vez que confirmes tu email, te guiaremos paso a paso para
                configurar tu perfil y tu negocio.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
