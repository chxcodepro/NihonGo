'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Brain, GraduationCap, Keyboard, ChevronRight, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Progress, Button } from '@repo/ui'
import { useAuthStore } from '@repo/shared/store/authStore'
import { useLearnStore } from '@repo/shared/store/learnStore'
import { useTranslation } from '@/hooks/useTranslation'

function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" className="text-sakura-500 transition-all duration-700"
        />
      </svg>
      <span className="absolute text-2xl font-bold">{percentage}%</span>
    </div>
  )
}

export default function LearnPage() {
  const { t } = useTranslation('learn')
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const { masteredKana } = useLearnStore()
  const overallProgress = Math.round((masteredKana.length / 92) * 100)
  const dailyGoal = 0
  const dailyTarget = 20
  const modules = [
    {
      title: t('kana.title'),
      description: t('kana.subtitle'),
      icon: BookOpen,
      href: '/learn/kana',
      color: 'text-sakura-500',
      bgColor: 'bg-sakura-50 dark:bg-sakura-950/20',
      borderColor: 'border-sakura-300 dark:border-sakura-500',
      gradient: { '--g1': '#ec4899', '--g2': '#f43f5e', '--g3': '#f97316' },
    },
    {
      title: t('vocabulary.title'),
      description: t('vocabulary.subtitle'),
      icon: Brain,
      href: '/learn/vocabulary',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      gradient: { '--g1': '#6366f1', '--g2': '#8b5cf6', '--g3': '#3b82f6' },
    },
    {
      title: t('grammar.title'),
      description: t('grammar.subtitle'),
      icon: GraduationCap,
      href: '/learn/grammar',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      gradient: { '--g1': '#10b981', '--g2': '#14b8a6', '--g3': '#22c55e' },
    },
    {
      title: t('typing.title'),
      description: t('typing.subtitle'),
      icon: Keyboard,
      href: '/learn/typing',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      gradient: { '--g1': '#f59e0b', '--g2': '#f97316', '--g3': '#eab308' },
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>
      </div>

      {isLoggedIn && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-sakura-200 dark:border-sakura-800">
            <CardContent className="flex items-center gap-6 p-6">
              <CircularProgress percentage={overallProgress} />
              <div>
                <p className="text-sm text-muted-foreground">{t('progress')}</p>
                <p className="mt-1 text-2xl font-bold">{masteredKana.length} / 92</p>
                <p className="text-sm text-muted-foreground">{t('mastered_kana')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-6 p-6">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/20">
                <Target className="h-12 w-12 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('daily_goal')}</p>
                <p className="mt-1 text-2xl font-bold">{dailyGoal} / {dailyTarget}</p>
                <Progress value={(dailyGoal / dailyTarget) * 100} className="mt-3" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((m, i) => (
          <motion.div
            key={m.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={m.href}>
              <div
                className="module-card-border"
                style={m.gradient as React.CSSProperties}
              >
                <Card className="group cursor-pointer border-0 transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-xl p-3 ${m.bgColor}`}>
                        <m.icon className={`h-6 w-6 ${m.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{m.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                        <div className="mt-4">
                          <Progress value={m.href === '/learn/kana' ? overallProgress : 0} className="h-1.5" />
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {isLoggedIn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              {t('recent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
              <BookOpen className="mb-3 h-12 w-12 opacity-30" />
              <p>{t('recent_empty')}</p>
              <Link href="/learn/kana">
                <Button variant="outline" className="mt-4">{t('recent_action')}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
