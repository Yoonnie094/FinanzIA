'use client'

import { useState, useEffect } from 'react'
import { Bot, User, CheckCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEMO_MESSAGES = [
  { role: 'user', text: 'Vendí 2 tortas de chocolate a 15 lucas cada una' },
  { role: 'bot', text: '¡Excelente! He registrado un ingreso de $30.000 bajo la categoría "Ventas". Tu balance actual ha subido.', showSuccess: true },
  { role: 'user', text: 'Compré 5 kilos de harina por $8.500' },
  { role: 'bot', text: 'Entendido. Gasto de $8.500 registrado en "Insumos". Te quedan 15kg en inventario.', showSuccess: true },
]

export function ChatDemo() {
  const [index, setIndex] = useState(0)
  const [visibleMessages, setVisibleMessages] = useState<typeof DEMO_MESSAGES>([])
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const runDemo = async () => {
      // Clear and restart
      setVisibleMessages([])
      setIndex(0)
      
      for (let i = 0; i < DEMO_MESSAGES.length; i++) {
        setIsTyping(true)
        await new Promise(r => setTimeout(r, 1500))
        setIsTyping(false)
        setVisibleMessages(prev => [...prev, DEMO_MESSAGES[i]])
        await new Promise(r => setTimeout(r, 3000))
        
        if (i === DEMO_MESSAGES.length - 1) {
          await new Promise(r => setTimeout(r, 5000))
          runDemo() // Loop
        }
      }
    }

    runDemo()
  }, [])

  return (
    <div className="flex flex-col h-[400px] w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Asistente FinanzIA</p>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <p className="text-[10px] text-muted-foreground">En línea</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {visibleMessages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === 'bot' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-2 text-sm max-w-[80%]",
                msg.role === 'user' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-foreground"
              )}
            >
              <p>{msg.text}</p>
              {msg.showSuccess && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-success font-medium">
                  <CheckCircle className="h-3 w-3" />
                  Registro completado
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 animate-pulse">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="rounded-2xl bg-muted px-4 py-2">
              <div className="flex gap-1">
                <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer input mockup */}
      <div className="border-t border-border p-3 bg-muted/30">
        <div className="flex h-9 items-center rounded-full border border-border bg-background px-4 text-xs text-muted-foreground">
          Escribe algo como "Hoy gasté..."
        </div>
      </div>
    </div>
  )
}
