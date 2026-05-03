export interface Transaction {
  id: string
  date: string
  amount: number
  concept: string
  category: string
  type: 'income' | 'expense'
  user_id?: string
}

export interface Profile {
  id: string
  first_name: string
  last_name: string
  phone: string | null
  email: string
  created_at?: string
  updated_at?: string
}

export interface Business {
  id: string
  user_id: string
  name: string
  category: string
  description: string | null
  has_location: boolean
  address: string | null
  comuna: string | null
  region: string | null
  created_at?: string
  updated_at?: string
}

export const BUSINESS_CATEGORIES = [
  'Alimentos y Bebidas',
  'Ropa y Accesorios',
  'Tecnologia',
  'Servicios Profesionales',
  'Salud y Belleza',
  'Educacion',
  'Transporte',
  'Construccion',
  'Agricultura',
  'Artesania',
  'Comercio Minorista',
  'Otro'
] as const

export const CHILEAN_REGIONS = [
  'Arica y Parinacota',
  'Tarapaca',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaiso',
  'Metropolitana',
  'O\'Higgins',
  'Maule',
  'Nuble',
  'Biobio',
  'La Araucania',
  'Los Rios',
  'Los Lagos',
  'Aysen',
  'Magallanes'
] as const

export interface FinancialSummary {
  balance: number
  monthlyIncome: number
  monthlyExpenses: number
  transactions: Transaction[]
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  fill: string
}

export interface MonthlyTrend {
  month: string
  income: number
  expenses: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isProcessing?: boolean
}
