'use client'

import { motion } from 'framer-motion'
import { Trophy, Frown, Equal } from 'lucide-react'
import { Button, Card } from '@repo/ui'

interface RaceStats {
  wpm: number
  accuracy: number
  time: number
}

interface RaceResultProps {
  result: 'win' | 'lose' | 'draw'
  playerStats: RaceStats
  aiStats: RaceStats
  onPlayAgain: () => void
  onBack: () => void
}

const resultConfig = {
  win: { icon: Trophy, text: '你赢了！', color: 'text-amber-500' },
  lose: { icon: Frown, text: 'AI赢了', color: 'text-[var(--color-coral)]' },
  draw: { icon: Equal, text: '平局', color: 'text-[var(--color-indigo)]' },
}

export function RaceResult({ result, playerStats, aiStats, onPlayAgain, onBack }: RaceResultProps) {
  const config = resultConfig[result]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto"
    >
      <Card className="p-8 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          <Icon className={`w-20 h-20 mx-auto ${config.color}`} />
        </motion.div>

        <h2 className={`text-3xl font-bold ${config.color}`}>{config.text}</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left text-muted-foreground">指标</th>
              <th className="py-2 text-center text-[var(--color-sakura)]">你</th>
              <th className="py-2 text-center text-[var(--color-indigo)]">AI</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 text-left text-muted-foreground">WPM</td>
              <td className="py-2 text-center font-bold">{playerStats.wpm}</td>
              <td className="py-2 text-center font-bold">{aiStats.wpm}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-left text-muted-foreground">正确率</td>
              <td className="py-2 text-center">{playerStats.accuracy}%</td>
              <td className="py-2 text-center">{aiStats.accuracy}%</td>
            </tr>
            <tr>
              <td className="py-2 text-left text-muted-foreground">用时</td>
              <td className="py-2 text-center">{playerStats.time}s</td>
              <td className="py-2 text-center">{aiStats.time}s</td>
            </tr>
          </tbody>
        </table>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onBack}>
            返回
          </Button>
          <Button className="flex-1" onClick={onPlayAgain}>
            再来一局
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
