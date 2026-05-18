import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryTheme(category: string | undefined): string {
  if (!category) return ''
  
  const mapping: Record<string, string> = {
    'Tecnologia': 'theme-tecnologia',
    'Alimentos y Bebidas': 'theme-alimentos',
    'Salud y Belleza': 'theme-belleza',
    'Agricultura': 'theme-agricultura',
    'Artesania': 'theme-artesania',
    'Ropa y Accesorios': 'theme-ropa',
    'Construccion': 'theme-construccion',
    'Transporte': 'theme-tecnologia', // Fallback or similar
    'Servicios Profesionales': 'theme-tecnologia',
    'Educacion': 'theme-tecnologia',
    'Comercio Minorista': 'theme-alimentos',
  }

  return mapping[category] || ''
}

export function escapeHTML(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

