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
import { Wallet, ArrowRight, Building2, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

const CURRENCIES = [
  { code: 'CLP', name: 'Peso Chileno' },
  { code: 'USD', name: 'Dólar Estadounidense' },
  { code: 'COP', name: 'Peso Colombiano' },
  { code: 'MXN', name: 'Peso Mexicano' },
  { code: 'ARS', name: 'Peso Argentino' },
  { code: 'PEN', name: 'Sol Peruano' },
  { code: 'EUR', name: 'Euro' },
]

// Rubros/industria del negocio
const BUSINESS_SECTORS = [
  'Tecnología y Electrónica',
  'Ropa y Accesorios',
  'Artesanías y Manualidades',
  'Alimentos y Bebidas',
  'Salud y Belleza',
  'Hogar y Decoración',
  'Educación y Capacitación',
  'Transporte y Logística',
  'Construcción y Remodelación',
  'Agricultura y Jardinería',
  'Entretenimiento y Arte',
  'Turismo y Gastronomía',
  'Comercio Minorista',
  'Servicios Profesionales',
  'Otro',
]

// Países con sus regiones/estados
const COUNTRIES_REGIONS: Record<string, { label: string; regions: string[] }> = {
  Chile: {
    label: 'Región',
    regions: [
      'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
      'Valparaíso', 'Metropolitana', "O'Higgins", 'Maule', 'Ñuble',
      'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes',
    ],
  },
  Colombia: {
    label: 'Departamento',
    regions: [
      'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
      'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
      'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
      'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
      'San Andrés', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada',
    ],
  },
  México: {
    label: 'Estado',
    regions: [
      'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
      'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango',
      'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán',
      'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro',
      'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco',
      'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
    ],
  },
  Argentina: {
    label: 'Provincia',
    regions: [
      'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
      'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
      'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
      'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
    ],
  },
  Perú: {
    label: 'Región',
    regions: [
      'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
      'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad',
      'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco',
      'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali',
    ],
  },
  España: {
    label: 'Comunidad Autónoma',
    regions: [
      'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias', 'Cantabria',
      'Castilla-La Mancha', 'Castilla y León', 'Cataluña', 'Ceuta', 'Extremadura',
      'Galicia', 'La Rioja', 'Madrid', 'Melilla', 'Murcia', 'Navarra',
      'País Vasco', 'Valencia',
    ],
  },
  'Estados Unidos': {
    label: 'Estado',
    regions: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
      'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
      'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
      'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
      'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
      'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
      'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia',
      'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
    ],
  },
  Otro: {
    label: 'Región / Estado',
    regions: [],
  },
}

const COUNTRY_LIST = Object.keys(COUNTRIES_REGIONS)

export default function BusinessInfoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phones: [''],
    category: '',
    customCategory: '',
    description: '',
    country: 'Chile',
    region: '',
    address: '',
    currency: 'CLP',
  })

  const countryData = COUNTRIES_REGIONS[formData.country] ?? { label: 'Región / Estado', regions: [] }
  const hasRegions = countryData.regions.length > 0

  const addPhone = () => setFormData({ ...formData, phones: [...formData.phones, ''] })
  const removePhone = (index: number) => setFormData({ ...formData, phones: formData.phones.filter((_, i) => i !== index) })
  const updatePhone = (index: number, value: string) => {
    const newPhones = [...formData.phones]
    newPhones[index] = value
    setFormData({ ...formData, phones: newPhones })
  }

  const handleCountryChange = (country: string) => {
    setFormData({ ...formData, country, region: '' })
  }

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

      // 1. Guardar datos del negocio
      const { error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          phones: formData.phones.filter(p => p.trim() !== ''),
          category: formData.category === 'Otro' ? formData.customCategory || 'Otro' : formData.category,
          description: formData.description || null,
          country: formData.country,
          region: formData.region || null,
          address: formData.address || null,
          currency: formData.currency,
        })

      if (businessError) {
        if (businessError.code === '23505') {
          throw new Error('Ya existe un negocio con este nombre. Elige otro.')
        }
        throw businessError
      }

      // 2. Sincronizar teléfono principal con auth.users (si existe)
      const primaryPhone = formData.phones.find(p => p.trim() !== '')
      if (primaryPhone) {
        await supabase.auth.updateUser({
          phone: primaryPhone.replace(/\s/g, '') // Quitar espacios para formato estándar
        })
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los datos del negocio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg">
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

        <Card className="border-border shadow-lg bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Tu Negocio</CardTitle>
            <CardDescription>Configura los detalles de tu emprendimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Nombre y Correo */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre único del negocio</Label>
                  <Input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Mi Negocio" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-email">Correo del negocio</Label>
                  <Input id="b-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="contacto@negocio.com" />
                </div>
              </div>

              {/* Teléfonos */}
              <div className="space-y-2">
                <Label>Teléfonos del negocio</Label>
                {formData.phones.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input value={phone} onChange={(e) => updatePhone(index, e.target.value)} placeholder="+56 9 ..." />
                    {formData.phones.length > 1 && (
                      <Button type="button" variant="outline" size="icon" onClick={() => removePhone(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={addPhone} className="text-primary">
                  <Plus className="mr-2 h-4 w-4" /> Añadir teléfono
                </Button>
              </div>

              {/* País y Moneda */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>País</Label>
                  <Select value={formData.country} onValueChange={handleCountryChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COUNTRY_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Moneda principal</Label>
                  <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.code} — {c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Región/Estado (dinámico según país) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{countryData.label}</Label>
                  {hasRegions ? (
                    <Select
                      value={formData.region}
                      onValueChange={(v) => setFormData({ ...formData, region: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Selecciona ${countryData.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {countryData.regions.map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      placeholder="Región o estado"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Dirección <span className="text-muted-foreground text-xs">(opcional)</span>
                  </Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle 123"
                  />
                </div>
              </div>

              {/* Rubro */}
              <div className="space-y-2">
                <Label>Rubro del negocio</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v, customCategory: '' })} required>
                  <SelectTrigger><SelectValue placeholder="Selecciona un rubro" /></SelectTrigger>
                  <SelectContent>
                    {BUSINESS_SECTORS.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.category === 'Otro' && (
                  <Input
                    placeholder="Describe el rubro de tu negocio..."
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    required
                    className="mt-2"
                  />
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label>
                  Descripción <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Describe brevemente tu negocio..."
                />
              </div>

              {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>}

              <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600" disabled={loading}>
                {loading ? 'Configurando...' : 'Finalizar y empezar'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
