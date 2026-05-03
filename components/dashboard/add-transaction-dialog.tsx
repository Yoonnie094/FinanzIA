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
  const [formData, setFormData] = useState({
    concept: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
            <Label htmlFor="concept" className="text-foreground">Concepto</Label>
            <Input
              id="concept"
              placeholder="Ej: Compra de harina"
              value={formData.concept}
              onChange={(e) =>
                setFormData({ ...formData, concept: e.target.value })
              }
              required
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount" className="text-foreground">Monto (CLP)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Ej: 25000"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
              min="1"
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category" className="text-foreground">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Selecciona una categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
