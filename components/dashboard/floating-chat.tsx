'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  Loader2,
  X,
  MessageCircle,
  Mic,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

function getUIMessageText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ''
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onFinish: () => {
      // Recarga los datos de la pagina (ej. el Dashboard) cuando la IA termina de hablar
      router.refresh()
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '¡Hola! Qué gusto saludarte. Soy Yoonnie, tu asistente de FinanzIA. 👋\n\n¡Hoy será un gran día para tu negocio! ¿En qué te puedo ayudar hoy? Puedes decirme algo como "Vendí 3 tortas" o preguntarme por el resumen de tus gastos.',
      }
    ]
  } as any)

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    fetch('/api/chat/history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: '¡Hola! Qué gusto saludarte. Soy Yoonnie, tu asistente de FinanzIA. 👋\n\n¡Hoy será un gran día para tu negocio! ¿En qué te puedo ayudar hoy? Puedes decirme algo como "Vendí 3 tortas" o preguntarme por el resumen de tus gastos.',
            },
            ...data
          ])
        }
      })
      .catch(err => console.error('Error fetching chat history:', err))
  }, [setMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  const quickActions = [
    { label: 'Resumen del mes', message: 'Dame un resumen de mis finanzas del mes' },
    { label: 'Registrar gasto', message: 'Quiero registrar un gasto' },
    { label: 'Registrar venta', message: 'Quiero registrar una venta' },
  ]

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir asistente IA"
        className={cn(
          'fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 md:bottom-6',
          'bg-gradient-to-br from-primary to-accent',
          'hover:scale-105 hover:shadow-xl',
          isOpen && 'scale-0 opacity-0'
        )}
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          'fixed bottom-24 right-4 z-50 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 md:bottom-6',
          isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-[oklch(0.55_0.22_280)] to-[oklch(0.6_0.18_250)] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Asistente IA</h3>
              <p className="text-xs text-white/70">Siempre disponible</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length <= 1 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div className="text-center px-4">
                <h2 className="text-base font-bold text-foreground">Tu asistente financiero</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Gestiona tu negocio conversando de forma natural.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 px-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      sendMessage({ text: action.message })
                    }}
                    className="h-8 px-3 text-[11px] font-medium transition-transform hover:scale-105 active:scale-95"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
              
              {/* Show the initial message even in welcome screen */}
              {messages.length === 1 && (
                <div className="mt-6 w-full space-y-3">
                  <div className="flex gap-2 justify-start">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.55_0.22_280)] to-[oklch(0.6_0.18_250)]">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="bg-secondary text-foreground max-w-[75%] rounded-2xl px-3 py-2">
                      <p className="text-xs whitespace-pre-wrap">{getUIMessageText(messages[0]) || (messages[0] as any).content}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const text = getUIMessageText(message) || (message as any).content || ''
                const isUser = message.role === 'user'

                const toolInvocations = message.parts?.filter(
                  (p) => p.type === 'tool-invocation'
                ) || []

                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-2',
                      isUser ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {!isUser && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.55_0.22_280)] to-[oklch(0.6_0.18_250)]">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-3 py-2',
                        isUser
                          ? 'bg-gradient-to-br from-primary to-accent text-white'
                          : 'bg-secondary text-foreground'
                      )}
                    >
                      {text && (
                        <p className="text-xs whitespace-pre-wrap">{text}</p>
                      )}
                      
                      {toolInvocations.map((part: { type: string; toolInvocation?: { toolName: string; state: string; output?: { success?: boolean; message?: string; transaction?: { type: string; amount: number }; balance?: number; totalIncome?: number; totalExpenses?: number } } }, idx: number) => {
                        if (part.type !== 'tool-invocation' || !part.toolInvocation) return null
                        const { toolName, state, output } = part.toolInvocation

                        if (state === 'output-available' && output) {
                          if (toolName === 'addTransaction' && output.success) {
                            return (
                              <div key={idx} className="mt-2 flex items-center gap-2 rounded-lg bg-success/20 p-2 text-success">
                                <CheckCircle className="h-3 w-3" />
                                <span className="text-[10px]">{output.message}</span>
                              </div>
                            )
                          }
                          
                          if (toolName === 'getTransactionsSummary' && output.success) {
                            return (
                              <div key={idx} className="mt-2 space-y-1.5 rounded-lg bg-secondary/50 p-2">
                                <div className="grid grid-cols-3 gap-1.5 text-center">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Ingresos</p>
                                    <p className="text-[10px] font-semibold text-[oklch(0.6_0.18_250)] flex items-center justify-center gap-0.5">
                                      <TrendingUp className="h-2.5 w-2.5" />
                                      ${(output.totalIncome || 0).toLocaleString('es-CL')}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Gastos</p>
                                    <p className="text-[10px] font-semibold text-[oklch(0.7_0.18_340)] flex items-center justify-center gap-0.5">
                                      <TrendingDown className="h-2.5 w-2.5" />
                                      ${(output.totalExpenses || 0).toLocaleString('es-CL')}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Balance</p>
                                    <p className={cn(
                                      'text-[10px] font-semibold',
                                      (output.balance || 0) >= 0 ? 'text-[oklch(0.6_0.18_250)]' : 'text-[oklch(0.7_0.18_340)]'
                                    )}>
                                      ${(output.balance || 0).toLocaleString('es-CL')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                        }

                        if (state === 'input-available' || state === 'input-streaming') {
                          return (
                            <div key={idx} className="mt-1.5 flex items-center gap-1.5 text-muted-foreground">
                              <Loader2 className="h-2.5 w-2.5 animate-spin" />
                              <span className="text-[10px]">Procesando...</span>
                            </div>
                          )
                        }

                        return null
                      })}
                    </div>
                    {isUser && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                )
              })}
              
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.55_0.22_280)] to-[oklch(0.6_0.18_250)]">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl bg-secondary px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Pensando...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex gap-2 justify-center">
                  <div className="rounded-2xl bg-destructive/10 px-3 py-2 border border-destructive/20 text-center">
                    <span className="text-xs text-destructive font-medium">Error: No se pudo conectar con la IA.</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-3 bg-muted/20">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full border-border bg-background text-muted-foreground hover:text-primary transition-colors"
              onClick={() => alert('Próximamente: Grabación de voz')}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Registrar venta, gasto..."
              disabled={isLoading}
              className="flex-1 h-9 text-sm bg-background border-border shadow-sm focus-visible:ring-primary"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="mt-2 text-center text-[9px] text-muted-foreground">
            <p>Presiona <span className="font-bold">Enter</span> para enviar.</p>
            <p className="mt-0.5 text-[8px] opacity-80">FinanzIA puede cometer errores. Verifica las transacciones registradas.</p>
          </div>
        </div>
      </div>
    </>
  )
}
