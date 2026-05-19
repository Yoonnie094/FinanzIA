'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface InsightsData {
  health: {
    status: 'excellent' | 'good' | 'warning' | 'critical'
    percentage: number
    message: string
  }
  tips: Array<{
    id: string
    title: string
    description: string
    type: 'info' | 'warning' | 'success'
  }>
  projection: string
}

interface DashboardContextType {
  insights: InsightsData | null
  loading: boolean
  refetch: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ 
  children, 
  refreshKey 
}: { 
  children: ReactNode
  refreshKey: string 
}) {
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/insights')
      const data = await res.json()
      setInsights(data)
    } catch (e) {
      console.error('Error fetching dashboard insights:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [refreshKey])

  return (
    <DashboardContext.Provider value={{ insights, loading, refetch: fetchInsights }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
