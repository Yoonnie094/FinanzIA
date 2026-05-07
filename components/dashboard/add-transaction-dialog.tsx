'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'

const CATEGORIES = [
  'Alimentos',
  'Transporte',
  'Servicios',
  'Ventas',
  'Insumos',
  'Arriendo',
  'Sueldos',
  'Marketing',
  'Otros',
]

export function AddTransactionDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    concept: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
  })
  const router = useRouter()

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.concept.trim()) newErrors.concept = 'El concepto es requerido'
    else if (formData.concept.length > 100) newErrors.concept = 'Máximo 100 caracteres'
    const amount = parseFloat(formData.amount)
    if (!formData.amount) newErrors.amount = 'El monto es requerido'
    else if (isNaN(amount) || amount < 1) newErrors.amount = 'El monto debe ser mayor a $1'
    else if (amount > 100000000) newErrors.amount = 'El monto no puede superar $100.000.000'
    if (!formData.category) newErrors.category = 'Selecciona una categoría'
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No user found')
      }
      
      const amount = parseFloat(formData.amount)
      
      const { error } = await supabase.from('transactions').insert({
        concept: formData.concept,
        amount: formData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        category: formData.category,
        type: formData.type,
        date: new Date().toISOString(),
        user_id: user.id,
      })

      if (error) throw error

      setOpen(false)
      setFormData({
        concept: '',
        amount: '',
        category: '',
        type: 'expense',
      })
      router.refresh()
    } catch (error) {
      console.error('Error adding transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Agregar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nueva Transaccion</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Registra un nuevo ingreso o gasto manualmente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="type" className="text-foreground">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'income' | 'expense') =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Gasto</SelectItem>
                <SelectItem value="income">Ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="concept" className="text-foreground">Concepto</Label>
              <span className={`text-xs ${formData.concept.length > 90 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {formData.concept.length}/100
              </span>
            </div>
            <Input
              id="concept"
              placeholder="Ej: Compra de harina"
              value={formData.concept}
              onChange={(e) => {
                if (e.target.value.length <= 100) setFormData({ ...formData, concept: e.target.value })
              }}
              maxLength={100}
              className={`bg-secondary/50 ${errors.concept ? 'border-destructive' : 'border-border'}`}
            />
            {errors.concept && <p className="text-xs text-destructive">{errors.concept}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount" className="text-foreground">Monto (CLP)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Ej: 25000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              min="1"
              max="100000000"
              className={`bg-secondary/50 ${errors.amount ? 'border-destructive' : 'border-border'}`}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category" className="text-foreground">Categoría</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                setFormData({ ...formData, category: value })
                if (errors.category) setErrors(prev => ({ ...prev, category: '' }))
              }}
            >
              <SelectTrigger className={`bg-secondary/50 ${errors.category ? 'border-destructive' : 'border-border'}`}>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setOpen(false); setErrors({}) }}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.category}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
