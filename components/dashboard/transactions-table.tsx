'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowUpRight, ArrowDownRight, Search, Filter, ChevronLeft, ChevronRight, MoreVertical, Trash2, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/lib/types'

interface TransactionsTableProps {
  transactions: Transaction[]
}

const PAGE_SIZE = 10

function formatRelativeDate(dateStr: string): string {
  const parts = dateStr.split('T')[0].split('-')
  const year = parseInt(parts[0])
  const month = parseInt(parts[1]) - 1
  const day = parseInt(parts[2])

  const txDate = new Date(year, month, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (txDate.getTime() === today.getTime()) return 'Hoy'
  if (txDate.getTime() === yesterday.getTime()) return 'Ayer'

  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${day} ${months[month]} ${year}`
}

export function TransactionsTable({ transactions: initialTransactions }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [mounted, setMounted] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, typeFilter, categoryFilter, dateFrom, dateTo])

  const categories = [...new Set(transactions.map((t) => t.category))].filter(Boolean)

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.concept.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || t.type === typeFilter
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter

    let matchesDateFrom = true
    let matchesDateTo = true
    if (dateFrom) {
      matchesDateFrom = t.date.split('T')[0] >= dateFrom
    }
    if (dateTo) {
      matchesDateTo = t.date.split('T')[0] <= dateTo
    }

    return matchesSearch && matchesType && matchesCategory && matchesDateFrom && matchesDateTo
  })

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedTransactions = filteredTransactions.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE
  )
  const startItem = filteredTransactions.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1
  const endItem = Math.min(safeCurrentPage * PAGE_SIZE, filteredTransactions.length)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(Math.abs(value))
  }

  const exportToCSV = () => {
    const headers = ['Fecha', 'Concepto', 'Categoría', 'Tipo', 'Monto']
    const rows = filteredTransactions.map((t) => [
      t.date.split('T')[0],
      t.concept,
      t.category,
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.amount,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(val => `"${val}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('transactions').delete().eq('id', deleteTarget.id)
      if (!error) {
        setTransactions(prev => prev.filter(t => t.id !== deleteTarget.id))
        router.refresh()
      }
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base font-semibold text-foreground">
                {filteredTransactions.length} transacciones
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredTransactions.length === 0}
                className="h-8 gap-2 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar CSV
              </Button>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-secondary/50 border-border pl-9 md:w-[180px]"
                />
              </div>
              {/* Type filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full bg-secondary/50 border-border md:w-[130px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Ingresos</SelectItem>
                  <SelectItem value="expense">Gastos</SelectItem>
                </SelectContent>
              </Select>
              {/* Category filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full bg-secondary/50 border-border md:w-[150px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Date range */}
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-secondary/50 border-border md:w-[150px] text-sm"
                title="Desde"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-secondary/50 border-border md:w-[150px] text-sm"
                title="Hasta"
              />
              {/* Clear filters */}
              {(dateFrom || dateTo || search !== '' || typeFilter !== 'all' || categoryFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('')
                    setTypeFilter('all')
                    setCategoryFilter('all')
                    setDateFrom('')
                    setDateTo('')
                  }}
                  className="text-xs text-muted-foreground"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center gap-2">
              <Filter className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {transactions.length === 0
                  ? 'No hay transacciones registradas'
                  : 'No se encontraron resultados'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="w-[110px] text-muted-foreground">Fecha</TableHead>
                      <TableHead className="text-muted-foreground">Concepto</TableHead>
                      <TableHead className="hidden md:table-cell text-muted-foreground">Categoría</TableHead>
                      <TableHead className="text-right text-muted-foreground">Monto</TableHead>
                      <TableHead className="w-[40px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="border-border hover:bg-secondary/30">
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {mounted ? formatRelativeDate(transaction.date) : ''}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                                transaction.type === 'income'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-accent/10 text-accent'
                              )}
                            >
                              {transaction.type === 'income' ? (
                                <ArrowUpRight className="h-4 w-4" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{transaction.concept}</p>
                              <p className="text-xs text-muted-foreground md:hidden">
                                {transaction.category}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
                            {transaction.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              'font-semibold',
                              transaction.type === 'income'
                                ? 'text-success'
                                : 'text-accent'
                            )}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(transaction)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Mostrando {startItem}–{endItem} de {filteredTransactions.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={safeCurrentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-2 text-sm text-foreground">
                      {safeCurrentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={safeCurrentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará permanentemente <strong>"{deleteTarget?.concept}"</strong> ({formatCurrency(deleteTarget?.amount ?? 0)}).
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
