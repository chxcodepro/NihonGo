'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@repo/ui'

const themes = ['light', 'dark', 'system'] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const next = () => {
    const idx = themes.indexOf(theme as typeof themes[number])
    setTheme(themes[(idx + 1) % themes.length])
  }

  const icon = theme === 'dark' ? <Moon className="h-4 w-4" /> : theme === 'light' ? <Sun className="h-4 w-4" /> : <Monitor className="h-4 w-4" />

  return (
    <Button variant="ghost" size="icon" onClick={next} title="切换主题" className="h-10 w-10 hover:bg-primary/15 dark:hover:bg-primary/20">
      {icon}
      <span className="sr-only">切换主题</span>
    </Button>
  )
}
