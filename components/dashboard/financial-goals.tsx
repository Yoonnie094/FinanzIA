'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Plus, Target, Trash2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Goal {
  id: string
  name: string
  target: number
  current: number
  color: string
}

export function FinancialGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching goals:', error)
      // Fallback to local storage if table doesn't exist
      const saved = localStorage.getItem('financial_goals')
      if (saved) setGoals(JSON.parse(saved))
    } else {
      setGoals(data || [])
    }
    setLoading(false)
  }

  const handleAddGoal = async () => {
    if (!newName || !newTarget) return
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newGoal = {
      user_id: user.id,
      name: newName,
      target: Number(newTarget),
      current: 0,
      color: 'bg-primary'
    }

    const { data, error } = await supabase
      .from('financial_goals')
      .insert(newGoal)
      .select()
      .single()

    if (error) {
      toast.error('No se pudo crear la meta')
    } else {
      setGoals([...goals, data])
      setNewName('')
      setNewTarget('')
      setOpen(false)
      toast.success('Meta creada con éxito')
    }
  }

  const handleDeleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('No se pudo eliminar la meta')
    } else {
      setGoals(goals.filter(g => g.id !== id))
      toast.success('Meta eliminada')
    }
  }

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(v)

  return (
    <Card className="border-border bg-card/50 backdrop-blur-md shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Metas Financieras
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nueva Meta</DialogTitle>
              <DialogDescription>Define un objetivo de ahorro para tu negocio.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre de la meta</Label>
                <Input id="name" placeholder="Ej: Nueva amasadora" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target">Monto objetivo ($)</Label>
                <Input id="target" type="number" placeholder="100000" value={newTarget} onChange={e => setNewTarget(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddGoal}>Crear Meta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : goals.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No tienes metas activas. ¡Crea una para motivarte!
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {goals.map((goal, index) => {
                const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100))
                return (
                  <motion.div 
                    key={goal.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-foreground">{goal.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatCurrency(goal.current)} de {formatCurrency(goal.target)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">{percentage}%</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
