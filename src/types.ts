export type MovementType = 'income' | 'expense'

export type Movement = {
  id: string
  type: MovementType
  description: string
  category: string
  amount: number
  date: string
}

export const incomeCategories = ['Ventas', 'Servicios', 'Otros ingresos']
export const expenseCategories = [
  'Materiales e insumos',
  'Transporte',
  'Arriendo y servicios',
  'Comisiones',
  'Sueldos y honorarios',
  'Otros gastos',
]

export const initialMovements: Movement[] = [
  { id: 'demo-1', type: 'income', description: 'Venta pedido #104', category: 'Ventas', amount: 185000, date: '2026-11-11' },
  { id: 'demo-2', type: 'expense', description: 'Insumos para producción', category: 'Materiales e insumos', amount: 42600, date: '2026-11-10' },
  { id: 'demo-3', type: 'income', description: 'Servicio de diseño', category: 'Servicios', amount: 95000, date: '2026-11-09' },
  { id: 'demo-4', type: 'expense', description: 'Comisión de pago', category: 'Comisiones', amount: 4750, date: '2026-11-08' },
  { id: 'demo-5', type: 'expense', description: 'Compra de empaques', category: 'Materiales e insumos', amount: 28700, date: '2026-11-07' },
  { id: 'demo-6', type: 'income', description: 'Ventas de la semana', category: 'Ventas', amount: 950000, date: '2026-11-06' },
  { id: 'demo-7', type: 'expense', description: 'Arriendo del taller', category: 'Arriendo y servicios', amount: 310000, date: '2026-11-05' },
  { id: 'demo-8', type: 'income', description: 'Pedido corporativo', category: 'Ventas', amount: 1315000, date: '2026-11-04' },
  { id: 'demo-9', type: 'expense', description: 'Compra a proveedor', category: 'Materiales e insumos', amount: 430000, date: '2026-11-03' },
  { id: 'demo-10', type: 'expense', description: 'Equipamiento menor', category: 'Otros gastos', amount: 349450, date: '2026-11-02' },
]
