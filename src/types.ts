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

export const initialMovements: Movement[] = []
