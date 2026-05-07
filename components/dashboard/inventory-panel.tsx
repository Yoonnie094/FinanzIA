'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, AlertTriangle, ArrowRight, Box } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

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

function InventorySkeletonRow() {
  return (
    <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-muted" />
        <div className="space-y-1.5">
          <div className="h-3 w-28 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
      </div>
      <div className="h-4 w-16 rounded bg-muted" />
    </div>
  )
}

export function InventoryPanel() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchInventory = async () => {
      const { data } = await supabase
        .from('inventory')
        .select('*')
        .order('updated_at', { ascending: false })
      setItems(data || [])
      setLoading(false)
    }

    fetchInventory()

    // Actualización en tiempo real cuando la IA modifica el inventario
    const channel = supabase
      .channel('inventory-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, fetchInventory)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) return 'empty'
    if (item.min_stock > 0 && item.quantity <= item.min_stock) return 'low'
    return 'ok'
  }

  if (loading) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Inventario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <InventorySkeletonRow key={i} />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Inventario</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] flex-col items-center justify-center gap-3">
          <Package className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Sin ítems en inventario</p>
          <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/dashboard/inventory">
              Agregar al inventario
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const lowStockCount = items.filter(i => getStockStatus(i) !== 'ok').length

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          Inventario
        </CardTitle>
        <div className="flex items-center gap-2">
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
              <AlertTriangle className="h-3 w-3" />
              {lowStockCount} alerta{lowStockCount > 1 ? 's' : ''}
            </span>
          )}
          <Button asChild variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/90">
            <Link href="/dashboard/inventory" className="flex items-center gap-1">
              Ver todo
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {items.slice(0, 5).map((item) => {
          const status = getStockStatus(item)
          return (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl bg-secondary/50 p-3 transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    status === 'empty'
                      ? 'bg-destructive/10 text-destructive'
                      : status === 'low'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-primary/10 text-primary'
                  )}
                >
                  {status === 'ok' ? (
                    <Box className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category || 'Sin categoría'}
                    {item.min_stock > 0 && ` · Mín: ${item.min_stock} ${item.unit}`}
                  </p>
                </div>
              </div>
              <p
                className={cn(
                  'text-sm font-semibold',
                  status === 'empty'
                    ? 'text-destructive'
                    : status === 'low'
                    ? 'text-warning'
                    : 'text-foreground'
                )}
              >
                {item.quantity} {item.unit}
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
