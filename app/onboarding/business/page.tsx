'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Wallet, ArrowRight, Building2, MapPin } from 'lucide-react'
import Link from 'next/link'
import { BUSINESS_CATEGORIES, CHILEAN_REGIONS } from '@/lib/types'

// Comunas por region (simplificado - principales comunas)
const COMUNAS_POR_REGION: Record<string, string[]> = {
  'Metropolitana': ['Santiago', 'Providencia', 'Las Condes', 'Nunoa', 'La Florida', 'Maipu', 'Puente Alto', 'San Bernardo', 'Vitacura', 'Lo Barnechea', 'Penalolen', 'La Reina', 'Macul', 'San Miguel', 'Independencia', 'Recoleta', 'Quilicura', 'Pudahuel', 'Cerrillos', 'Estacion Central'],
  'Valparaiso': ['Valparaiso', 'Vina del Mar', 'Quilpue', 'Villa Alemana', 'Con Con', 'San Antonio', 'Quillota', 'La Calera'],
  'Biobio': ['Concepcion', 'Talcahuano', 'Chillan', 'Los Angeles', 'Coronel', 'San Pedro de la Paz', 'Hualpen'],
  'La Araucania': ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucon', 'Angol'],
  'Los Lagos': ['Puerto Montt', 'Osorno', 'Castro', 'Puerto Varas', 'Ancud'],
  'Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel'],
  'O\'Higgins': ['Rancagua', 'San Fernando', 'Rengo', 'Machali'],
  'Maule': ['Talca', 'Curico', 'Linares', 'Constitucion'],
  'Antofagasta': ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones'],
  'Tarapaca': ['Iquique', 'Alto Hospicio', 'Pozo Almonte'],
  'Arica y Parinacota': ['Arica', 'Putre'],
  'Atacama': ['Copiapo', 'Vallenar', 'Caldera', 'Chanaral'],
  'Nuble': ['Chillan', 'San Carlos', 'Bulnes'],
  'Los Rios': ['Valdivia', 'La Union', 'Panguipulli', 'Rio Bueno'],
  'Aysen': ['Coyhaique', 'Puerto Aysen', 'Chile Chico'],
  'Magallanes': ['Punta Arenas', 'Puerto Natales', 'Porvenir']
}

export default function BusinessInfoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    hasLocation: false,
    address: '',
    region: '',
    comuna: ''
  })

  const comunasDisponibles = formData.region ? COMUNAS_POR_REGION[formData.region] || [] : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: formData.name,
          category: formData.category,
          description: formData.description || null,
          has_location: formData.hasLocation,
          address: formData.hasLocation ? formData.address : null,
          comuna: formData.hasLocation ? formData.comuna : null,
          region: formData.hasLocation ? formData.region : null
        })

      if (businessError) {
        throw businessError
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los datos del negocio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              FinanzIA
            </span>
          </Link>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 flex justify-center gap-2">
          <div className="h-2 w-16 rounded-full bg-primary" />
          <div className="h-2 w-16 rounded-full bg-primary" />
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Tu Negocio</CardTitle>
            <CardDescription>
              Cuentanos sobre el emprendimiento que quieres gestionar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del negocio</Label>
                <Input
                  id="name"
                  placeholder="Mi Emprendimiento"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripcion (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe brevemente tu negocio..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Tengo local o direccion</p>
                    <p className="text-sm text-muted-foreground">Para recomendaciones locales</p>
                  </div>
                </div>
                <Switch
                  checked={formData.hasLocation}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasLocation: checked, region: '', comuna: '', address: '' })}
                />
              </div>

              {formData.hasLocation && (
                <div className="space-y-4 rounded-lg border border-border p-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select 
                      value={formData.region} 
                      onValueChange={(value) => setFormData({ ...formData, region: value, comuna: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu region" />
                      </SelectTrigger>
                      <SelectContent>
                        {CHILEAN_REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.region && (
                    <div className="space-y-2">
                      <Label htmlFor="comuna">Comuna</Label>
                      <Select 
                        value={formData.comuna} 
                        onValueChange={(value) => setFormData({ ...formData, comuna: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu comuna" />
                        </SelectTrigger>
                        <SelectContent>
                          {comunasDisponibles.map((comuna) => (
                            <SelectItem key={comuna} value={comuna}>{comuna}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="address">Direccion (opcional)</Label>
                    <Input
                      id="address"
                      placeholder="Calle Principal 123"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                disabled={loading || !formData.category}
              >
                {loading ? 'Guardando...' : 'Comenzar a usar FinanzIA'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
