'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Brain, GraduationCap, Keyboard, ChevronRight, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Progress, Button } from '@repo/ui'
import { useLearnStore } from '@repo/shared/store/learnStore'

const modules = [
  {
    title: '五十音图',
    description: '学习平假名和片假名的基础发音与书写',
    icon: BookOpen,
    href: '/learn/kana',
    color: 'text-sakura-500',
    bgColor: 'bg-sakura-50 dark:bg-sakura-950/20',
    borderColor: 'border-sakura-200 dark:border-sakura-800',
  },
  {
    title: '词汇学习',
    description: '按JLPT级别学习日语核心词汇',
    icon: Brain,
    href: '/learn/vocabulary',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
  },
  {
    title: '语法课程',
    description: '系统学习日语语法结构与用法',
    icon: GraduationCap,
    href: '/learn/grammar',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    title: '打字练习',
    description: '通过打字练习提升日语输入速度',
    icon: Keyboard,
    href: '/learn/typing',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
]

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
  const { masteredKana } = useLearnStore()
  const overallProgress = Math.round((masteredKana.length / 92) * 100)
  const dailyGoal = 0
  const dailyTarget = 20

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">学习中心</h1>
        <p className="mt-1 text-muted-foreground">系统化日语学习，从零开始掌握日语</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-sakura-200 dark:border-sakura-800">
          <CardContent className="flex items-center gap-6 p-6">
            <CircularProgress percentage={overallProgress} />
            <div>
              <p className="text-sm text-muted-foreground">总体学习进度</p>
              <p className="mt-1 text-2xl font-bold">{masteredKana.length} / 92</p>
              <p className="text-sm text-muted-foreground">已掌握假名数</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-6 p-6">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/20">
              <Target className="h-12 w-12 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">今日目标</p>
              <p className="mt-1 text-2xl font-bold">{dailyGoal} / {dailyTarget}</p>
              <Progress value={(dailyGoal / dailyTarget) * 100} className="mt-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((m, i) => (
          <motion.div
            key={m.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={m.href}>
              <Card className={`group cursor-pointer border transition-all hover:shadow-md ${m.borderColor}`}>
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
            </Link>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            最近学习记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
            <BookOpen className="mb-3 h-12 w-12 opacity-30" />
            <p>开始你的第一次学习吧！</p>
            <Link href="/learn/kana">
              <Button variant="outline" className="mt-4">从五十音开始</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
