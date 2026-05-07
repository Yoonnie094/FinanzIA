'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'

export function StockAlertNotifier() {
  useEffect(() => {
    // Solo ejecutar si el navegador soporta notificaciones
    if (typeof window === 'undefined' || !('Notification' in window)) return

    const checkLowStock = async () => {
      const supabase = createClient()
      const { data: items } = await supabase
        .from('inventory')
        .select('name, quantity, min_stock, unit')
        .gt('min_stock', 0)

      if (!items || items.length === 0) return

      const lowStockItems = items.filter(
        (item) => item.quantity <= item.min_stock && item.min_stock > 0
      )

      if (lowStockItems.length === 0) return

      // Solicitar permiso si no está dado
      if (Notification.permission === 'default') {
        await Notification.requestPermission()
      }

      if (Notification.permission === 'granted') {
        // Evitar spam: verificar si ya se notificó esta sesión
        const notifiedKey = `stock_notified_${new Date().toDateString()}`
        if (sessionStorage.getItem(notifiedKey)) return
        sessionStorage.setItem(notifiedKey, '1')

        if (lowStockItems.length === 1) {
          const item = lowStockItems[0]
          // Notificación del navegador
          new Notification('⚠️ Stock bajo en FinanzIA', {
            body: `${item.name}: quedan ${item.quantity} ${item.unit}`,
            icon: '/icon.svg',
          })
          // Notificación visual en la app (Sonner)
          toast.warning(`Stock bajo: ${item.name}`, {
            description: `Quedan solo ${item.quantity} ${item.unit}.`,
            icon: <AlertTriangle className="h-4 w-4" />,
            duration: 10000,
          })
        } else {
          // Notificación del navegador
          new Notification(`⚠️ ${lowStockItems.length} productos con stock bajo`, {
            body: lowStockItems.slice(0, 3).map(i => `• ${i.name}: ${i.quantity} ${i.unit}`).join('\n'),
            icon: '/icon.svg',
          })
          // Notificación visual en la app (Sonner)
          toast.warning('Múltiples productos con stock bajo', {
            description: `${lowStockItems.length} artículos requieren reposición.`,
            icon: <AlertTriangle className="h-4 w-4" />,
            duration: 10000,
          })
        }
      }
    }

    // Ejecutar al abrir el dashboard
    checkLowStock()
  }, [])

  return null
}
