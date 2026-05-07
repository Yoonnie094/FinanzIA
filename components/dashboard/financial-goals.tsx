'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Plus, Target, MoreVertical, Trash2 } from 'lucide-react'
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

interface Goal {
  id: string
  name: string
  target: number
  current: number
  color: string
}

export function FinancialGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('financial_goals')
    if (saved) {
      setGoals(JSON.parse(saved))
    } else {
      // Default goal
      const defaultGoal = [{ id: '1', name: 'Fondo de Emergencia', target: 500000, current: 125000, color: 'bg-primary' }]
      setGoals(defaultGoal)
      localStorage.setItem('financial_goals', JSON.stringify(defaultGoal))
    }
  }, [])

  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals)
    localStorage.setItem('financial_goals', JSON.stringify(newGoals))
  }

  const handleAddGoal = () => {
    if (!newName || !newTarget) return
    const goal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      target: Number(newTarget),
      current: 0,
      color: 'bg-primary'
    }
    saveGoals([...goals, goal])
    setNewName('')
    setNewTarget('')
    setOpen(false)
  }

  const handleDeleteGoal = (id: string) => {
    saveGoals(goals.filter(g => g.id !== id))
  }

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(v)

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Metas Financieras
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
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
        {goals.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No tienes metas activas. ¡Crea una para motivarte!
          </div>
        ) : (
          goals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100))
            return (
              <div key={goal.id} className="space-y-2 group">
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
                <Progress value={percentage} className="h-1.5" indicatorClassName={goal.color} />
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
