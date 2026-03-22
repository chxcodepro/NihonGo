'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Keyboard, Gamepad2, Settings } from 'lucide-react'
import { cn } from '@repo/ui'

const tabs = [
  { href: '/', label: '首页', icon: Home },
  { href: '/learn', label: '学习', icon: BookOpen, excludeHrefs: ['/learn/typing'] },
  { href: '/learn/typing', label: '打字', icon: Keyboard },
  { href: '/game', label: '游戏', icon: Gamepad2 },
  { href: '/settings', label: '设置', icon: Settings },
]

function isTabActive(
  pathname: string | null,
  href: string,
  options?: { exact?: boolean; excludeHrefs?: string[] }
) {
  if (!pathname) return false

  const isExcluded = options?.excludeHrefs?.some((excludedHref) =>
    pathname === excludedHref || pathname.startsWith(`${excludedHref}/`)
  )

  if (isExcluded) return false

  if (options?.exact) {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = isTabActive(pathname, tab.href, {
            exact: tab.href === '/',
            excludeHrefs: tab.excludeHrefs,
          })

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
