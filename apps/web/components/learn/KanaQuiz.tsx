'use client'

import { useState, useMemo, useCallback } from 'react'
import { Button, Badge, Progress } from '@repo/ui'
import type { KanaItem } from '@repo/shared'

interface KanaQuizProps {
  kanaData: KanaItem[]
  onClose: () => void
}

type QuizMode = 'romaji-to-kana' | 'listen-select'

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function KanaQuiz({ kanaData, onClose }: KanaQuizProps) {
  const [mode, setMode] = useState<QuizMode>('romaji-to-kana')
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [answered, setAnswered] = useState<string | null>(null)
  const [questionIdx, setQuestionIdx] = useState(0)

  const questions = useMemo(() => shuffleArray(kanaData).slice(0, 20), [kanaData])
  const current = questions[questionIdx]

  const options = useMemo(() => {
    if (!current) return []
    const others = kanaData.filter((k) => k.id !== current.id)
    const picked = shuffleArray(others).slice(0, 3)
    return shuffleArray([current, ...picked])
  }, [current, kanaData])

  const handleAnswer = useCallback((kana: KanaItem) => {
    if (answered) return
    setAnswered(kana.id)
    setScore((s) => ({
      correct: s.correct + (kana.id === current.id ? 1 : 0),
      total: s.total + 1,
    }))
  }, [answered, current])

  const handleNext = () => {
    setAnswered(null)
    setQuestionIdx((i) => i + 1)
  }

  const handlePlayAudio = () => {
    if (!current) return
    const utterance = new SpeechSynthesisUtterance(current.audioText)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  if (questionIdx >= questions.length) {
    const pct = Math.round((score.correct / score.total) * 100)
    return (
      <div className="space-y-6 py-4 text-center">
        <p className="text-4xl">🎉</p>
        <p className="text-xl font-bold">测验完成！</p>
        <p className="text-3xl font-bold text-sakura-500">{pct}%</p>
        <p className="text-muted-foreground">正确 {score.correct} / 总计 {score.total}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onClose}>关闭</Button>
          <Button onClick={() => { setQuestionIdx(0); setScore({ correct: 0, total: 0 }); setAnswered(null) }}>
            再来一次
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge
            variant={mode === 'romaji-to-kana' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setMode('romaji-to-kana')}
          >
            罗马音→假名
          </Badge>
          <Badge
            variant={mode === 'listen-select' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setMode('listen-select')}
          >
            听音选字
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          正确 {score.correct} / 总计 {score.total}
        </span>
      </div>

      <Progress value={(questionIdx / questions.length) * 100} className="h-1.5" />

      <div className="text-center">
        {mode === 'romaji-to-kana' ? (
          <p className="text-3xl font-bold">{current.romaji}</p>
        ) : (
          <Button variant="outline" size="lg" onClick={handlePlayAudio} className="text-xl">
            🔊 播放发音
          </Button>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          选择对应的假名（第 {questionIdx + 1} / {questions.length} 题）
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          let variant: 'default' | 'outline' | 'destructive' = 'outline'
          let extraClass = ''

          if (answered) {
            if (opt.id === current.id) {
              extraClass = 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30'
            } else if (opt.id === answered) {
              extraClass = 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30'
            }
          }

          return (
            <Button
              key={opt.id}
              variant={variant}
              className={`h-16 text-2xl font-jp ${extraClass}`}
              onClick={() => handleAnswer(opt)}
              disabled={!!answered}
            >
              {opt.char}
            </Button>
          )
        })}
      </div>

      {answered && (
        <div className="text-center">
          <Button onClick={handleNext}>下一题</Button>
        </div>
      )}
    </div>
  )
}
