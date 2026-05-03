import { createClient } from '@/lib/supabase/server'
import { TransactionsTable } from '@/components/dashboard/transactions-table'
import { AddTransactionDialog } from '@/components/dashboard/add-transaction-dialog'
import type { Transaction } from '@/lib/types'

async function getTransactions(): Promise<Transaction[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data || []
}

export default async function TransactionsPage() {
  const transactions = await getTransactions()

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Registros</h1>
          <p className="text-sm text-muted-foreground">
            Historial de todas tus transacciones
          </p>
        </div>
        <AddTransactionDialog />
      </div>

      <TransactionsTable transactions={transactions} />
    </div>
  )
}
