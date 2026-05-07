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
import { Plus, Trash2, Wallet, Loader2, ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function SignUpPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phones, setPhones] = useState([''])
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const addPhone = () => setPhones([...phones, ''])
  const removePhone = (index: number) => setPhones(phones.filter((_, i) => i !== index))
  const updatePhone = (index: number, value: string) => {
    const newPhones = [...phones]
    newPhones[index] = value
    setPhones(newPhones)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phones: phones.filter(p => p.trim() !== ''),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      
      // Si Supabase devuelve sesión es porque la confirmación de email está desactivada
      if (data.session) {
        router.push('/onboarding/business')
      } else {
        // Si está activada, ir a la página de éxito
        router.push('/auth/sign-up-success')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Ocurrió un error')
    } finally {
      setIsLoading(false)
    }
  }

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
          
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">Crear Cuenta</CardTitle>
              <CardDescription className="text-muted-foreground">
                Tus datos personales para comenzar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName" className="text-foreground">Nombre</Label>
                      <Input 
                        id="firstName" 
                        required 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        placeholder="Juan"
                        className="bg-secondary/50 border-border"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName" className="text-foreground">Apellido</Label>
                      <Input 
                        id="lastName" 
                        required 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        placeholder="Pérez"
                        className="bg-secondary/50 border-border"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="tu@email.com"
                      className="bg-secondary/50 border-border"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-foreground">Teléfonos de contacto</Label>
                    {phones.map((phone, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={phone}
                          onChange={(e) => updatePhone(index, e.target.value)}
                          placeholder="+56 9 ..."
                          type="tel"
                          className="bg-secondary/50 border-border"
                        />
                        {phones.length > 1 && (
                          <Button type="button" variant="outline" size="icon" onClick={() => removePhone(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" onClick={addPhone} className="w-fit text-primary hover:text-primary/90">
                      <Plus className="mr-2 h-4 w-4" /> Añadir otro teléfono
                    </Button>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password" title="Contraseña" className="text-foreground">Contraseña</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-secondary/50 border-border"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password" title="Repetir Contraseña" className="text-foreground">Repetir Contraseña</Label>
                    <Input 
                      id="repeat-password" 
                      type="password" 
                      required 
                      value={repeatPassword} 
                      onChange={(e) => setRepeatPassword(e.target.value)}
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
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        Siguiente: Mi Negocio
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  ¿Ya tienes cuenta?{' '}
                  <Link
                    href="/auth/login"
                    className="text-primary font-medium hover:underline underline-offset-4"
                  >
                    Inicia Sesión
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
