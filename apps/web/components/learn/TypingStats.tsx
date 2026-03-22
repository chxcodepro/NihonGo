'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { useTypingStore } from '@repo/shared/store/typingStore'
import { Gauge, Target, Timer, TrendingUp } from 'lucide-react'

interface TypingStatsProps {
  wpm: number
  accuracy: number
  time: number
  isActive: boolean
}

function CircularGauge({ value, max, label, unit, color }: { value: number; max: number; label: string; unit: string; color: string }) {
  const radius = 35
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value / max, 1)
  const strokeDashoffset = circumference - pct * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
          <circle
            cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" className={`${color} transition-all duration-500`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{value}</span>
          <span className="text-[10px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="mt-1 text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export function TypingStats({ wpm, accuracy, time, isActive }: TypingStatsProps) {
  const { results } = useTypingStore()

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const avgWpm = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / results.length)
    : 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Gauge className="h-4 w-4" />
            实时数据
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-around pb-4">
          <CircularGauge value={wpm} max={120} label="速度" unit="WPM" color="text-sakura-500" />
          <CircularGauge value={accuracy} max={100} label="准确率" unit="%" color="text-emerald-500" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              用时
            </div>
            <span className="font-mono font-medium">{formatTime(time)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              历史平均 WPM
            </div>
            <span className="font-mono font-medium">{avgWpm}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              总练习次数
            </div>
            <span className="font-mono font-medium">{results.length}</span>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">最近成绩</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            {results.slice(-5).reverse().map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                <span>{r.wpm} WPM</span>
                <span className="text-muted-foreground">{r.accuracy}%</span>
                <span className="text-muted-foreground">{Math.round(r.time)}s</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
