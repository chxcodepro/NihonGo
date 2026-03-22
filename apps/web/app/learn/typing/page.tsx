'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, Button, Badge } from '@repo/ui'
import { typingMaterials } from '@repo/question-bank'
import { useTypingStore } from '@repo/shared/store/typingStore'
import { TypingPractice } from '@/components/learn/TypingPractice'
import { TypingStats } from '@/components/learn/TypingStats'
import { Keyboard, Play, RotateCcw } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface TypingMaterial {
  id: string
  mode: string
  difficulty: string
  text: string
  title: string
}

export default function TypingPage() {
  const { t } = useTranslation('learn')
  const [mode, setMode] = useState('hiragana')
  const [difficulty, setDifficulty] = useState('easy')
  const [isStarted, setIsStarted] = useState(false)
  const { wpm, accuracy, isActive, startPractice, reset } = useTypingStore()

  const materials = typingMaterials as unknown as TypingMaterial[]
  const modes = [
    { id: 'hiragana', name: t('typing.mode.hiragana_input') },
    { id: 'katakana', name: t('typing.mode.katakana_input') },
    { id: 'words', name: t('typing.mode.word') },
    { id: 'sentences', name: t('typing.mode.sentence') },
  ]
  const difficulties = [
    { id: 'easy', name: t('typing.difficulty.easy') },
    { id: 'medium', name: t('typing.difficulty.medium') },
    { id: 'hard', name: t('typing.difficulty.hard') },
  ]

  const currentText = useMemo(() => {
    const match = materials.find((m) => m.mode === mode && m.difficulty === difficulty)
    return match?.text || 'あいうえおかきくけこ'
  }, [materials, mode, difficulty])

  const handleStart = () => {
    startPractice(currentText, mode)
    setIsStarted(true)
  }

  const handleReset = () => {
    reset()
    setIsStarted(false)
  }

  const handleComplete = () => {
    setIsStarted(false)
  }

  const elapsed = useTypingStore((s) => s.startTime ? Math.round((Date.now() - s.startTime) / 1000) : 0)

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('typing.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('typing.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('typing.mode_label')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {modes.map((m) => (
                  <Badge
                    key={m.id}
                    variant={mode === m.id ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => { if (!isActive) setMode(m.id) }}
                  >
                    {m.name}
                  </Badge>
                ))}
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t('typing.difficulty_label')}</span>
                {difficulties.map((d) => (
                  <Badge
                    key={d.id}
                    variant={difficulty === d.id ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => { if (!isActive) setDifficulty(d.id) }}
                  >
                    {d.name}
                  </Badge>
                ))}
              </div>
              <div className="ml-auto">
                {!isStarted ? (
                  <Button size="sm" onClick={handleStart}>
                    <Play className="mr-1 h-4 w-4" />
                    {t('typing.start')}
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={handleReset}>
                    <RotateCcw className="mr-1 h-4 w-4" />
                    {t('typing.restart')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {isStarted ? (
            <TypingPractice text={currentText} onComplete={handleComplete} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Keyboard className="mb-4 h-16 w-16 opacity-20" />
                <p className="text-lg">{t('typing.ready_title')}</p>
                <p className="mt-1 text-sm">{t('typing.ready_description')}</p>
                <Button className="mt-6" onClick={handleStart}>
                  <Play className="mr-1 h-4 w-4" />
                  {t('typing.start')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-20">
            <TypingStats wpm={wpm} accuracy={accuracy} time={elapsed} isActive={isActive} />
          </div>
        </div>
      </div>
    </div>
  )
}
