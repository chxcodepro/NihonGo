'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import { Button, Card, Select } from '@repo/ui'
import { useGameStore } from '@repo/shared/store/gameStore'
import { typingRaceLevels } from '@repo/question-bank'
import { TypingRace } from '@/components/game/TypingRace'
import { RaceResult } from '@/components/game/RaceResult'

type Phase = 'setup' | 'countdown' | 'racing' | 'result'

export default function TypingRacePage() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [countdown, setCountdown] = useState(3)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const { typingRace, startRace, finishRace } = useGameStore()

  const startCountdown = useCallback(() => {
    const allLevels = Array.isArray(typingRaceLevels) ? typingRaceLevels : []
    const level = allLevels.find((l: any) => l.difficulty === difficulty) ?? allLevels[0]
    const texts = level?.texts ?? ['あいうえお']
    const text = texts[Math.floor(Math.random() * texts.length)]
    startRace(difficulty, text)

    setCountdown(3)
    setPhase('countdown')

    let count = 3
    const timer = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0) {
        clearInterval(timer)
        setPhase('racing')
      }
    }, 1000)
  }, [difficulty, startRace])

  const handleRaceComplete = useCallback(() => {
    finishRace()
    setPhase('result')
  }, [finishRace])

  const handlePlayAgain = useCallback(() => {
    setPhase('setup')
  }, [])

  const result = typingRace.playerWpm > typingRace.aiWpm
    ? 'win'
    : typingRace.playerWpm < typingRace.aiWpm
      ? 'lose'
      : 'draw' as const

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
        <Zap className="w-8 h-8 text-[var(--color-sakura)]" />
        打字竞速
      </h1>

      <AnimatePresence mode="wait">
        {phase === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto"
          >
            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">难度选择</label>
                <Select
                  value={difficulty}
                  onValueChange={(v) => setDifficulty(v as 'easy' | 'medium' | 'hard')}
                >
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">AI对手</label>
                <Select value="normal" onValueChange={() => {}}>
                  <option value="normal">普通AI</option>
                  <option value="fast">快速AI</option>
                  <option value="expert">专家AI</option>
                </Select>
              </div>
              <Button className="w-full" onClick={startCountdown}>
                开始比赛
              </Button>
            </Card>
          </motion.div>
        )}

        {phase === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-64"
          >
            <motion.span
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-8xl font-bold text-[var(--color-sakura)]"
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}

        {phase === 'racing' && (
          <motion.div
            key="racing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TypingRace
              text={typingRace.text}
              difficulty={difficulty}
              onComplete={handleRaceComplete}
            />
          </motion.div>
        )}

        {phase === 'result' && (
          <RaceResult
            result={result}
            playerStats={{
              wpm: typingRace.playerWpm,
              accuracy: typingRace.playerAccuracy,
              time: typingRace.startTime ? Math.round((Date.now() - typingRace.startTime) / 1000) : 0,
            }}
            aiStats={{
              wpm: typingRace.aiWpm,
              accuracy: 98,
              time: typingRace.startTime ? Math.round((Date.now() - typingRace.startTime) / 1000) : 0,
            }}
            onPlayAgain={handlePlayAgain}
            onBack={() => window.history.back()}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
