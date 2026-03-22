'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@repo/ui'
import { useGameStore } from '@repo/shared/store/gameStore'
import { RaceProgress } from '@/components/game/RaceProgress'

interface TypingRaceProps {
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
  onComplete: () => void
}

const AI_WPM_RANGE = {
  easy: { min: 20, max: 35 },
  medium: { min: 35, max: 55 },
  hard: { min: 55, max: 80 },
}

export function TypingRace({ text, difficulty, onComplete }: TypingRaceProps) {
  const [input, setInput] = useState('')
  const [startTime] = useState(Date.now())
  const [aiProgress, setAiProgress] = useState(0)
  const [aiWpm, setAiWpm] = useState(0)
  const [playerWpm, setPlayerWpm] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const aiTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { updatePlayerInput } = useGameStore()

  const playerProgress = text.length > 0 ? Math.min((input.length / text.length) * 100, 100) : 0

  // 计算正确率
  const correctChars = input.split('').filter((ch, i) => ch === text[i]).length
  const accuracy = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100

  // 更新玩家WPM
  useEffect(() => {
    const elapsed = (Date.now() - startTime) / 1000 / 60
    if (elapsed > 0) {
      const wpm = Math.round(correctChars / 5 / elapsed)
      setPlayerWpm(wpm)
      updatePlayerInput(input)
    }
  }, [input, correctChars, startTime, playerProgress, accuracy, updatePlayerInput])

  // AI对手模拟
  useEffect(() => {
    const range = AI_WPM_RANGE[difficulty]
    const targetWpm = range.min + Math.random() * (range.max - range.min)
    const charsPerMs = (targetWpm * 5) / 60 / 1000

    aiTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const aiChars = Math.min(elapsed * charsPerMs, text.length)
      const progress = (aiChars / text.length) * 100
      setAiProgress(progress)

      const minutes = elapsed / 1000 / 60
      if (minutes > 0) {
        setAiWpm(Math.round(aiChars / 5 / minutes))
      }

      if (progress >= 100) {
        if (aiTimerRef.current) clearInterval(aiTimerRef.current)
        onComplete()
      }
    }, 100)

    return () => {
      if (aiTimerRef.current) clearInterval(aiTimerRef.current)
    }
  }, [difficulty, text, startTime, onComplete])

  // 自动聚焦
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)

    if (value.length >= text.length) {
      if (aiTimerRef.current) clearInterval(aiTimerRef.current)
      onComplete()
    }
  }, [text, onComplete])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 目标文本 */}
      <div className="bg-muted/50 rounded-lg p-6">
        <p className="text-xl font-jp leading-relaxed tracking-wide">
          {text.split('').map((char, i) => {
            let className = 'text-muted-foreground'
            if (i < input.length) {
              className = input[i] === char
                ? 'text-[var(--color-emerald)]'
                : 'text-[var(--color-coral)] bg-[var(--color-coral)]/10'
            } else if (i === input.length) {
              className = 'underline text-foreground'
            }
            return (
              <span key={i} className={className}>
                {char}
              </span>
            )
          })}
        </p>
      </div>

      {/* 输入框 */}
      <Input
        ref={inputRef}
        value={input}
        onChange={handleInput}
        placeholder="在此输入..."
        className="text-lg font-jp"
        autoComplete="off"
        spellCheck={false}
      />

      {/* 进度条 */}
      <div className="space-y-4">
        <RaceProgress
          label="你"
          progress={playerProgress}
          wpm={playerWpm}
          color="sakura"
          isPlayer
        />
        <RaceProgress
          label="AI"
          progress={aiProgress}
          wpm={aiWpm}
          color="indigo"
          isPlayer={false}
        />
      </div>

      {/* 实时数据 */}
      <div className="flex justify-center gap-8 text-sm text-muted-foreground">
        <span>正确率: <strong className="text-foreground">{accuracy}%</strong></span>
        <span>WPM: <strong className="text-foreground">{playerWpm}</strong></span>
      </div>
    </div>
  )
}
