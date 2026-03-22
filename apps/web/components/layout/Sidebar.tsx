'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Languages, PenTool, Keyboard } from 'lucide-react'
import { cn } from '@repo/ui'
import { useTranslation } from '@/hooks/useTranslation'

interface SidebarProps {
  className?: string
}

const sections = [
  { href: '/learn/kana', labelKey: 'kana.title', icon: BookOpen, progress: 0 },
  { href: '/learn/vocabulary', labelKey: 'vocabulary.title', icon: Languages, progress: 0 },
  { href: '/learn/grammar', labelKey: 'grammar.title', icon: PenTool, progress: 0 },
  { href: '/learn/typing', labelKey: 'typing.title', icon: Keyboard, progress: 0 },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useTranslation('learn')
  const [expanded, setExpanded] = useState(false)

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={cn(
        'hidden lg:flex flex-col bg-background transition-all duration-300',
        expanded ? 'w-64' : 'w-16',
        className
      )}
    >
      <nav className="flex-1 space-y-1 px-2 py-4">
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = pathname?.startsWith(section.href)

          return (
            <Link
              key={section.href}
              href={section.href}
              className={cn(
                'flex items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              title={!expanded ? t(section.labelKey) : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <div
                className={cn(
                  'min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-all duration-300',
                  expanded ? 'max-w-full opacity-100' : 'max-w-0 opacity-0'
                )}
              >
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{t(section.labelKey)}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
