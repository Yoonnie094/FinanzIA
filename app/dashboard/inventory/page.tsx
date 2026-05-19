'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Package, AlertTriangle, Box, TrendingUp, Plus, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InventoryItem {
  id: number
  name: string
  quantity: number
  unit: string
  min_stock: number
  cost_unit: number
  category: string
  updated_at: string
}

const INVENTORY_CATEGORIES = ['Insumos', 'Herramientas', 'Repuestos', 'Materiales', 'Embalaje', 'Equipos', 'Otros']

const emptyForm = { name: '', quantity: '', unit: '', min_stock: '', cost_unit: '', category: 'Insumos' }

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  // Dialog de agregar
  const [addOpen, setAddOpen] = useState(false)
  // Dialog de editar: guardamos el ítem que se edita
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  // Form unificado
  const [form, setForm] = useState(emptyForm)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchInventory = async (uid?: string) => {
    const activeUserId = uid || userId
    if (!activeUserId) return
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', activeUserId)
      .order('name', { ascending: true })
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => {
    let channel: any

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUserId(user.id)
      await fetchInventory(user.id)
      
      channel = supabase
        .channel(`inv-rt-${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'inventory', 
            filter: `user_id=eq.${user.id}` 
          }, 
          () => fetchInventory(user.id)
        )
        .subscribe()
    }

    init()

    return () => { 
      if (channel) {
        supabase.removeChannel(channel) 
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openAdd = () => { setForm(emptyForm); setFormError(null); setAddOpen(true) }
  const openEdit = (item: InventoryItem) => {
    setEditItem(item)
    setForm({ name: item.name, quantity: String(item.quantity), unit: item.unit, min_stock: String(item.min_stock), cost_unit: String(item.cost_unit), category: item.category || 'Insumos' })
    setFormError(null)
    setEditOpen(true)
  }

  const handleSave = async (mode: 'add' | 'edit') => {
    if (!form.name.trim() || !form.quantity || !form.unit.trim()) {
      setFormError('Nombre, cantidad y unidad son requeridos.')
      return
    }
    setSaving(true)
    setFormError(null)
    const payload = {
      name: form.name.trim(),
      quantity: Number(form.quantity),
      unit: form.unit.trim(),
      min_stock: Number(form.min_stock) || 0,
      cost_unit: Number(form.cost_unit) || 0,
      category: form.category,
      updated_at: new Date().toISOString(),
    }
    if (mode === 'edit' && editItem) {
      const { error } = await supabase.from('inventory').update(payload).eq('id', editItem.id)
      if (error) { setFormError('Error al guardar.'); setSaving(false); return }
      setEditOpen(false)
      setEditItem(null)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('inventory').insert({ ...payload, user_id: user!.id })
      if (error) { setFormError('Error al crear.'); setSaving(false); return }
      setAddOpen(false)
    }
    setSaving(false)
    fetchInventory()
  }

  const handleDelete = async (id: number) => {
    await supabase.from('inventory').delete().eq('id', id)
    fetchInventory()
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) return 'empty'
    if (item.min_stock > 0 && item.quantity <= item.min_stock) return 'low'
    return 'ok'
  }

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(v)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  const lowStockItems = items.filter(i => getStockStatus(i) !== 'ok')
  const totalValue = items.reduce((s, i) => s + i.quantity * i.cost_unit, 0)

  // JSX del formulario — inline para evitar pérdida de foco
  const formJSX = (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="f-name">Nombre del producto *</Label>
        <Input id="f-name" placeholder="Ej: Pasta térmica" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="f-qty">Cantidad *</Label>
          <Input id="f-qty" type="number" min="0" placeholder="10" value={form.quantity}
            onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="f-unit">Unidad *</Label>
          <Input id="f-unit" placeholder="tubo, botella 1L, caja x50" value={form.unit}
            onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="f-min">Stock mínimo</Label>
          <Input id="f-min" type="number" min="0" placeholder="2" value={form.min_stock}
            onChange={e => setForm(f => ({ ...f, min_stock: e.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="f-cost">Costo por unidad</Label>
          <Input id="f-cost" type="number" min="0" placeholder="2500" value={form.cost_unit}
            onChange={e => setForm(f => ({ ...f, cost_unit: e.target.value }))} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Categoría</Label>
        <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {INVENTORY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {formError && <p className="text-sm text-destructive">{formError}</p>}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">

      {/* Dialog AGREGAR */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo ítem de inventario</DialogTitle>
            <DialogDescription>Agrega un producto o material manualmente.</DialogDescription>
          </DialogHeader>
          {formJSX}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button onClick={() => handleSave('add')} disabled={saving}>
              {saving ? 'Guardando...' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog EDITAR — fuera del .map() */}
      <Dialog open={editOpen} onOpenChange={open => { setEditOpen(open); if (!open) setEditItem(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar ítem</DialogTitle>
            <DialogDescription>Modifica los datos de &quot;{editItem?.name}&quot;.</DialogDescription>
          </DialogHeader>
          {formJSX}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={() => handleSave('edit')} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Inventario</h1>
          <p className="text-sm text-muted-foreground">Control de stock y materiales de tu negocio</p>
        </div>
        <Button onClick={openAdd} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
          <Plus className="h-4 w-4" /> Agregar ítem
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div><p className="text-xs text-muted-foreground">Productos</p><p className="text-xl font-bold text-foreground">{items.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div><p className="text-xs text-muted-foreground">Alertas de stock</p><p className="text-xl font-bold text-foreground">{lowStockItems.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[oklch(0.6_0.18_250)]/10">
              <TrendingUp className="h-5 w-5 text-[oklch(0.6_0.18_250)]" />
            </div>
            <div><p className="text-xs text-muted-foreground">Valor en stock</p><p className="text-xl font-bold text-foreground">{formatCurrency(totalValue)}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta stock bajo */}
      {lowStockItems.length > 0 && (
        <Card className="mb-6 border-yellow-500/30 bg-yellow-500/5 shadow-sm">
          <CardContent className="p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              {lowStockItems.length} ítem{lowStockItems.length > 1 ? 's' : ''} con stock bajo o agotado
            </p>
            <div className="space-y-1">
              {lowStockItems.map(i => (
                <p key={i.id} className="text-xs text-muted-foreground">
                  • <strong>{i.name}</strong>: {i.quantity} {i.unit}{i.min_stock > 0 && ` (mínimo: ${i.min_stock})`}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla */}
      {loading ? (
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">Cargando inventario...</p>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex h-48 flex-col items-center justify-center gap-3">
            <Package className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Sin ítems en inventario</p>
            <p className="text-xs text-muted-foreground/70 text-center">
              Agrégalos manualmente o dile a la IA: &quot;Compré 10 tubos de pasta térmica&quot;
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">Producto</p>
                <p className="text-xs font-medium text-muted-foreground text-right">Categoría</p>
                <p className="text-xs font-medium text-muted-foreground text-right">Costo/u</p>
                <p className="text-xs font-medium text-muted-foreground text-right">Stock</p>
                <p className="text-xs font-medium text-muted-foreground text-right">Acciones</p>
              </div>
              {items.map((item) => {
                const status = getStockStatus(item)
                return (
                  <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-secondary/40">
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        status === 'empty' ? 'bg-destructive/10 text-destructive' :
                        status === 'low'   ? 'bg-yellow-500/10 text-yellow-500' : 'bg-primary/10 text-primary')}>
                        {status === 'ok' ? <Box className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.updated_at)}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{item.category || '—'}</span>
                    <p className="text-sm text-muted-foreground text-right">{item.cost_unit > 0 ? formatCurrency(item.cost_unit) : '—'}</p>
                    <p className={cn('text-sm font-semibold text-right min-w-[60px]',
                      status === 'empty' ? 'text-destructive' :
                      status === 'low'   ? 'text-yellow-600 dark:text-yellow-400' : 'text-foreground')}>
                      {item.quantity} {item.unit}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar &quot;{item.name}&quot;?</AlertDialogTitle>
                            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      <p className="mt-4 text-center text-xs text-muted-foreground">También puedes gestionar el inventario desde el chat IA</p>
    </div>
  )
}
