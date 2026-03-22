'use client'

import { Heart } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export function Footer() {
  const { t } = useTranslation('common')

  return (
    <footer className="relative mt-8">
      <div className="absolute -top-20 left-0 w-full overflow-hidden leading-none">
        <div className="relative" style={{ width: '200%', animation: 'wave-drift 12s linear infinite' }}>
          <svg viewBox="0 0 2400 120" preserveAspectRatio="none" className="relative block h-20 w-full">
            <path
              d="M0,30 C200,90 400,0 600,60 C800,120 1000,10 1200,30 C1400,90 1600,0 1800,60 C2000,120 2200,10 2400,30 L2400,120 L0,120 Z"
              className="fill-muted/70"
            />
          </svg>
        </div>
      </div>

      <div className="bg-muted/70 pt-8 pb-0">
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
