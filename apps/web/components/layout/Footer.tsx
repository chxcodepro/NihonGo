'use client'

import Link from 'next/link'
import { Github, Heart } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export function Footer() {
  const { t } = useTranslation('common')

  const footerLinks = [
    { label: t('footer_kana'), href: '/learn/kana' },
    { label: t('footer_vocab'), href: '/learn/vocabulary' },
    { label: t('footer_grammar'), href: '/learn/grammar' },
    { label: t('footer_typing'), href: '/learn/typing' },
    { label: t('footer_games'), href: '/game' },
  ]

  return (
    <footer className="relative mt-20">
      <div className="absolute -top-16 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-16 w-full">
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.11,130.83,141.14,214.86,116.87,253.45,107.31,287.64,82.21,321.39,56.44Z"
            className="fill-muted/40"
          />
        </svg>
      </div>

      <div className="bg-muted/40 pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                  日
                </span>
                <span className="text-lg font-bold tracking-tight">
                  Nihon<span className="text-primary">Go</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                {t('footer_desc')}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">{t('footer_quick')}</h4>
              <nav className="flex flex-wrap gap-x-6 gap-y-2">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-6">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              &copy; {new Date().getFullYear()} NihonGo &middot; Made with
              <Heart className="h-3 w-3 text-primary fill-primary" />
            </p>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
