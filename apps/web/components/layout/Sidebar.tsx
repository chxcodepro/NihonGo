'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, BookOpen, Languages, PenTool, Keyboard } from 'lucide-react'
import { Button, Progress, cn } from '@repo/ui'

interface SidebarProps {
  className?: string
  currentPath?: string
}

const sections = [
  { href: '/learn/kana', label: '五十音', icon: BookOpen, progress: 0 },
  { href: '/learn/vocabulary', label: '词汇', icon: Languages, progress: 0 },
  { href: '/learn/grammar', label: '语法', icon: PenTool, progress: 0 },
  { href: '/learn/typing', label: '打字', icon: Keyboard, progress: 0 },
]

export function Sidebar({ className, currentPath }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex items-center justify-end p-2">
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = currentPath?.startsWith(section.href)

          return (
            <Link
              key={section.href}
              href={section.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <span>{section.label}</span>
                  <Progress value={section.progress} className="mt-1 h-1" />
                </div>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
