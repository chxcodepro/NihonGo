'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, LogIn, LogOut, User, Settings } from 'lucide-react'
import { useAuthStore } from '@repo/shared/store/authStore'
import {
  Button,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@repo/ui'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { LocaleSwitcher } from '@/components/common/LocaleSwitcher'
import { useTranslation } from '@/hooks/useTranslation'

function isNavItemActive(
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

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname()
  const { isLoggedIn, user, logout } = useAuthStore()
  const [sheetOpen, setSheetOpen] = useState(false)
  const { t } = useTranslation('nav')

  const navLinks: { href: string; label: string; excludeHrefs?: string[] }[] = []

  return (
    <header className={transparent
      ? 'sticky top-0 z-50 w-full bg-white/30 backdrop-blur-lg dark:bg-transparent dark:backdrop-blur-md'
      : 'sticky top-0 z-50 w-full glass border-b border-border/40'}
    >
      <div className="container relative z-10 mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8 min-w-0">
          <Link href="/" className="group flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold transition-transform group-hover:scale-110">
              日
            </span>
            <span className="text-xl font-bold tracking-tight">
              Nihon<span className="text-primary">Go</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = isNavItemActive(pathname, link.href, {
                excludeHrefs: link.excludeHrefs,
              })

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 text-sm font-medium transition-colors hover:text-primary ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <ThemeToggle />
          <LocaleSwitcher />

          {isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    {t('profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden w-24 shrink-0 justify-center md:inline-flex hover:bg-primary/15 dark:hover:bg-primary/20"
            >
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                {t('login')}
              </Link>
            </Button>
          )}

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{t('home')}</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-3">
                {navLinks.map((link) => {
                  const isActive = isNavItemActive(pathname, link.href, {
                    excludeHrefs: link.excludeHrefs,
                  })

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSheetOpen(false)}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                        isActive
                          ? 'bg-accent text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
                {!isLoggedIn && (
                  <Link
                    href="/login"
                    onClick={() => setSheetOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
                  >
                    {t('login')}
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
