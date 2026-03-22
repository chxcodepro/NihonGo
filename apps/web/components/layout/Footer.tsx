'use client'

import { Heart } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export function Footer() {
  const { t } = useTranslation('common')

  return (
    <footer className="relative mt-8">
      <div className="absolute -top-10 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-10 w-full">
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.11,130.83,141.14,214.86,116.87,253.45,107.31,287.64,82.21,321.39,56.44Z"
            className="fill-muted/40"
          />
        </svg>
      </div>

      <div className="bg-muted/40 pt-8 pb-0">
        <div className="container mx-auto px-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                日
              </span>
              <span className="text-lg font-bold tracking-tight">
                Nihon<span className="text-primary">Go</span>
              </span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              {t('footer_desc')}
            </p>
          </div>

          <div className="mt-6 flex justify-center border-t border-border/50 pt-4 text-center">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} NihonGo &middot; Made with
              <Heart className="h-3 w-3 text-primary fill-primary" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
