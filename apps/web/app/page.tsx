'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Brain, GraduationCap, Keyboard, Bot, Gamepad2, ArrowRight, Sparkles } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardDescription } from '@repo/ui'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useTranslation } from '@/hooks/useTranslation'

const featureMeta = [
  { icon: BookOpen, titleKey: 'feature_kana', descKey: 'feature_kana_desc', accent: 'from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20', iconColor: 'text-rose-500' },
  { icon: Brain, titleKey: 'feature_vocab', descKey: 'feature_vocab_desc', accent: 'from-violet-500/10 to-indigo-500/10 dark:from-violet-500/20 dark:to-indigo-500/20', iconColor: 'text-violet-500' },
  { icon: GraduationCap, titleKey: 'feature_grammar', descKey: 'feature_grammar_desc', accent: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20', iconColor: 'text-emerald-500' },
  { icon: Keyboard, titleKey: 'feature_typing', descKey: 'feature_typing_desc', accent: 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20', iconColor: 'text-amber-500' },
  { icon: Bot, titleKey: 'feature_ai', descKey: 'feature_ai_desc', accent: 'from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20', iconColor: 'text-cyan-500' },
  { icon: Gamepad2, titleKey: 'feature_game', descKey: 'feature_game_desc', accent: 'from-fuchsia-500/10 to-purple-500/10 dark:from-fuchsia-500/20 dark:to-purple-500/20', iconColor: 'text-fuchsia-500' },
]

const stepMeta = [
  { labelKey: 'path_beginner', descKey: 'path_beginner_desc', kanji: '初' },
  { labelKey: 'path_basic', descKey: 'path_basic_desc', kanji: '基' },
  { labelKey: 'path_intermediate', descKey: 'path_intermediate_desc', kanji: '進' },
  { labelKey: 'path_advanced', descKey: 'path_advanced_desc', kanji: '極' },
]

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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function HomePage() {
  const { t } = useTranslation('home')

  return (
    <>
      <Navbar />
      <PageWrapper>
        <main className="min-h-screen overflow-x-hidden">
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

            <div className="container mx-auto px-4 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t('badge')}
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <span className="bg-gradient-to-r from-primary via-rose-400 to-amber-400 dark:via-rose-300 dark:to-amber-300 bg-clip-text text-transparent">
                  NihonGo
                </span>
              </motion.h1>

              <motion.p
                className="mt-5 text-lg md:text-xl text-muted-foreground max-w-lg mx-auto font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {t('hero_subtitle_prefix')}<span className="font-jp text-foreground font-medium">{t('hero_subtitle_kana')}</span>{t('hero_subtitle_suffix')}
              </motion.p>

              <motion.div
                className="mt-10 flex items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button size="lg" asChild className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow animate-pulse-glow">
                  <Link href="/learn">
                    {t('cta_start')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-full px-8">
                  <a href="#features">{t('cta_more')}</a>
                </Button>
              </motion.div>
            </div>
          </section>

          {/* ===== Features ===== */}
          <section id="features" className="py-20 md:py-28">
            <div className="container mx-auto px-4">
              <motion.div
                className="text-center mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold">
                  {t('features_title')}<span className="text-primary">{t('features_title_accent')}</span>
                </h2>
                <p className="mt-3 text-muted-foreground">{t('features_subtitle')}</p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                {featureMeta.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <motion.div key={feature.titleKey} variants={itemVariants}>
                      <Card className={`group relative h-full overflow-hidden border-transparent bg-gradient-to-br ${feature.accent} cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                        <CardHeader className="relative z-10">
                          <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-background/80 shadow-sm ${feature.iconColor}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <CardTitle className="text-lg">{t(feature.titleKey)}</CardTitle>
                          <CardDescription className="text-sm leading-relaxed">{t(feature.descKey)}</CardDescription>
                        </CardHeader>
                        <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          </section>

          {/* ===== Learning Path ===== */}
          <section className="py-20 md:py-28 bg-muted/30 grain-overlay relative">
            <div className="container mx-auto px-4">
              <motion.div
                className="text-center mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold">
                  {t('path_title')}<span className="text-primary">{t('path_title_accent')}</span>
                </h2>
                <p className="mt-3 text-muted-foreground">{t('path_subtitle')}</p>
              </motion.div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0">
                {stepMeta.map((step, i) => (
                  <motion.div
                    key={step.labelKey}
                    className="flex items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                  >
                    <div className="flex flex-col items-center text-center group">
                      <div className="relative">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-rose-400 text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                          <span className="font-jp text-2xl font-bold">{step.kanji}</span>
                        </div>
                        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-bold border-2 border-primary text-primary">
                          {i + 1}
                        </span>
                      </div>
                      <h3 className="mt-4 font-semibold text-lg">{t(step.labelKey)}</h3>
                      <p className="text-sm text-muted-foreground">{t(step.descKey)}</p>
                    </div>
                    {i < stepMeta.length - 1 && (
                      <div className="hidden md:flex items-center mx-6 lg:mx-10">
                        <div className="h-0.5 w-12 lg:w-20 bg-gradient-to-r from-primary/40 to-primary/10 rounded-full" />
                        <ArrowRight className="h-4 w-4 text-primary/30 -ml-1" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== CTA ===== */}
          <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
              <motion.div
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-rose-500/90 p-10 md:p-16 text-center text-white shadow-2xl shadow-primary/20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="absolute top-4 left-6 font-jp text-6xl font-bold text-white/10">学</span>
                <span className="absolute bottom-4 right-6 font-jp text-6xl font-bold text-white/10">習</span>

                <h2 className="text-3xl md:text-4xl font-bold relative z-10">
                  {t('cta_title')}
                </h2>
                <p className="mt-4 text-lg text-white/80 max-w-md mx-auto relative z-10">
                  {t('cta_desc')}
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="mt-8 rounded-full px-10 bg-white text-primary hover:bg-white/90 shadow-lg relative z-10"
                >
                  <Link href="/learn/kana">
                    {t('cta_button')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </section>
        </main>
      </PageWrapper>
      <Footer />
    </>
  )
}
