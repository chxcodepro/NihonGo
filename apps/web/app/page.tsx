'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useTranslation } from '@/hooks/useTranslation'

const floatingChars = [
  { char: 'あ', x: 8, y: 15, delay: 0, size: 'text-5xl md:text-7xl' },
  { char: 'い', x: 85, y: 10, delay: 1.2, size: 'text-4xl md:text-6xl' },
  { char: 'う', x: 20, y: 65, delay: 0.6, size: 'text-4xl md:text-5xl' },
  { char: 'え', x: 70, y: 55, delay: 1.8, size: 'text-3xl md:text-5xl' },
  { char: 'お', x: 45, y: 80, delay: 0.3, size: 'text-4xl md:text-6xl' },
  { char: '日', x: 88, y: 70, delay: 2.1, size: 'text-3xl md:text-4xl' },
  { char: '本', x: 5, y: 40, delay: 1.5, size: 'text-3xl md:text-4xl' },
  { char: '語', x: 55, y: 25, delay: 0.9, size: 'text-4xl md:text-5xl' },
  { char: 'か', x: 35, y: 45, delay: 2.4, size: 'text-3xl md:text-4xl' },
  { char: '学', x: 78, y: 35, delay: 1.1, size: 'text-3xl md:text-5xl' },
]

export default function HomePage() {
  const { t } = useTranslation('home')

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100dvh-66px)] flex-col">
        <PageWrapper className="flex-1">
          <main className="flex-1 overflow-x-hidden">
            {/* ===== Hero ===== */}
            <section className="relative overflow-hidden hero-gradient grain-overlay py-24 md:py-40">
              <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
                {floatingChars.map((item, i) => (
                  <span
                    key={i}
                    className={`absolute font-jp font-bold text-primary/[0.06] dark:text-primary/[0.08] ${item.size} ${i % 2 === 0 ? 'animate-float' : 'animate-float-reverse'}`}
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      animationDelay: `${item.delay}s`,
                    }}
                  >
                    {item.char}
                  </span>
                ))}
              </div>

              <div className="container relative z-10 mx-auto px-4 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {t('badge')}
                </motion.div>

                <motion.h1
                  className="text-5xl font-extrabold leading-none tracking-tight md:text-7xl lg:text-8xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  <span className="bg-gradient-to-r from-primary via-rose-400 to-amber-400 bg-clip-text text-transparent dark:via-rose-300 dark:to-amber-300">
                    NihonGo
                  </span>
                </motion.h1>

                <motion.p
                  className="mx-auto mt-5 max-w-lg text-lg font-light text-muted-foreground md:text-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {t('hero_subtitle_prefix')}<span className="font-jp font-medium text-foreground">{t('hero_subtitle_kana')}</span>{t('hero_subtitle_suffix')}
                </motion.p>
              </div>
            </section>
          </main>
        </PageWrapper>
        <Footer />
      </div>
    </>
  )
}
