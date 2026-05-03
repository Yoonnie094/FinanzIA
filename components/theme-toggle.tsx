'use client'

import * as React from 'react'
import { Moon, Sun, Monitor, ChevronDown } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleSelectTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    setOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-secondary/80 cursor-pointer"
        aria-label="Cambiar tema"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-4 w-4 text-primary" />
        ) : (
          <Sun className="h-4 w-4 text-primary" />
        )}
      </button>
      
      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-md border border-border bg-popover p-1 shadow-md z-50">
          <button
            type="button"
            onClick={() => handleSelectTheme('light')}
            className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${theme === 'light' ? 'bg-accent text-accent-foreground' : 'text-popover-foreground'}`}
          >
            <Sun className="h-4 w-4" />
            Claro
          </button>
          <button
            type="button"
            onClick={() => handleSelectTheme('dark')}
            className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${theme === 'dark' ? 'bg-accent text-accent-foreground' : 'text-popover-foreground'}`}
          >
            <Moon className="h-4 w-4" />
            Oscuro
          </button>
          <button
            type="button"
            onClick={() => handleSelectTheme('system')}
            className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${theme === 'system' ? 'bg-accent text-accent-foreground' : 'text-popover-foreground'}`}
          >
            <Monitor className="h-4 w-4" />
            Sistema
          </button>
        </div>
      )}
    </div>
  )
}
