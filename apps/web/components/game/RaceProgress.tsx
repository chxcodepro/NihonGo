'use client'

import { motion } from 'framer-motion'
import { Progress } from '@repo/ui'

interface RaceProgressProps {
  label: string
  progress: number
  wpm: number
  color: 'sakura' | 'indigo'
  isPlayer: boolean
}

export function RaceProgress({ label, progress, wpm, color, isPlayer }: RaceProgressProps) {
  const colorVar = color === 'sakura' ? 'var(--color-sakura)' : 'var(--color-indigo)'

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className={`font-medium ${isPlayer ? 'text-[var(--color-sakura)]' : 'text-[var(--color-indigo)]'}`}>
          {label}
        </span>
        <span className="text-muted-foreground">{wpm} WPM</span>
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: colorVar }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <p className="text-xs text-right text-muted-foreground">
        {Math.round(progress)}%
      </p>
    </div>
  )
}
