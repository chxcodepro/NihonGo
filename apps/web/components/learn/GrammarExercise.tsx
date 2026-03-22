'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, Button, Input, Badge } from '@repo/ui'
import { grammarN5Data } from '@repo/question-bank'
import type { GrammarItem } from '@repo/shared'
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface GrammarExerciseProps {
  grammarId: string
}

interface Exercise {
  type: 'choice' | 'fill' | 'reorder'
  question: string
  options?: string[]
  answer: string
  explanation: string
  words?: string[]
}

function generateExercises(grammarId: string): Exercise[] {
  const data = grammarN5Data as unknown as GrammarItem[]
  const grammar = data.find((g) => g.id === grammarId)
  if (!grammar || grammar.examples.length === 0) return []

  const exercises: Exercise[] = []
  const ex = grammar.examples[0]

  exercises.push({
    type: 'choice',
    question: `"${grammar.title}" 的含义是什么？`,
    options: [grammar.meaning, '因为...所以', '虽然...但是', '如果...就'],
    answer: grammar.meaning,
    explanation: `${grammar.title} 表示 "${grammar.meaning}"`,
  })

  if (ex) {
    exercises.push({
      type: 'fill',
      question: ex.japanese.replace(grammar.title, '____'),
      answer: grammar.title,
      explanation: `完整句子：${ex.japanese}（${ex.meaning}）`,
    })

    const words = ex.japanese.split(/(?=[はがをでにのもと])/).filter(Boolean)
    if (words.length > 1) {
      exercises.push({
        type: 'reorder',
        question: `将以下词语排列成正确的句子：（释义：${ex.meaning}）`,
        words: [...words].sort(() => Math.random() - 0.5),
        answer: ex.japanese,
        explanation: `正确顺序：${ex.japanese}`,
      })
    }
  }

  return exercises
}

export function GrammarExercise({ grammarId }: GrammarExerciseProps) {
  const { t } = useTranslation('learn')
  const exercises = useMemo(() => generateExercises(grammarId), [grammarId])
  const [idx, setIdx] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [orderedWords, setOrderedWords] = useState<string[]>([])

  const current = exercises[idx]

  const handleReset = useCallback(() => {
    setIdx(0)
    setAnswered(false)
    setIsCorrect(false)
    setUserAnswer('')
    setOrderedWords([])
  }, [])

  // Reset when grammarId changes
  useMemo(() => { handleReset() }, [grammarId, handleReset])

  if (!current || exercises.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('grammar.exercise.empty')}
        </CardContent>
      </Card>
    )
  }

  const checkAnswer = () => {
    let correct = false
    if (current.type === 'choice') {
      correct = userAnswer === current.answer
    } else if (current.type === 'fill') {
      correct = userAnswer.trim() === current.answer
    } else if (current.type === 'reorder') {
      correct = orderedWords.join('') === current.answer
    }
    setIsCorrect(correct)
    setAnswered(true)
  }

  const handleNext = () => {
    setAnswered(false)
    setIsCorrect(false)
    setUserAnswer('')
    setOrderedWords([])
    setIdx((i) => i + 1)
  }

  const handleWordClick = (word: string, wordIdx: number) => {
    if (answered) return
    if (orderedWords.includes(word)) {
      setOrderedWords(orderedWords.filter((_, i) => i !== orderedWords.indexOf(word)))
    } else {
      setOrderedWords([...orderedWords, word])
    }
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{t('grammar.practice')}</h3>
          <span className="text-sm text-muted-foreground">
            {t('grammar.exercise.question')} {idx + 1} / {exercises.length}
          </span>
        </div>

        <div className="space-y-4">
          <p className="text-lg">{current.question}</p>

          {current.type === 'choice' && current.options && (
            <div className="grid grid-cols-2 gap-3">
              {current.options.map((opt) => {
                let cls = ''
                if (answered) {
                  if (opt === current.answer) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                  else if (opt === userAnswer) cls = 'border-red-500 bg-red-50 dark:bg-red-950/20'
                }
                return (
                  <Button
                    key={opt}
                    variant="outline"
                    className={`h-auto whitespace-normal py-3 ${cls} ${userAnswer === opt && !answered ? 'border-sakura-500' : ''}`}
                    onClick={() => !answered && setUserAnswer(opt)}
                  >
                    {opt}
                  </Button>
                )
              })}
            </div>
          )}

          {current.type === 'fill' && (
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={t('grammar.exercise.fill_placeholder')}
              className="font-jp text-lg"
              disabled={answered}
            />
          )}

          {current.type === 'reorder' && current.words && (
            <div className="space-y-3">
              <div className="min-h-[48px] rounded-lg border-2 border-dashed p-3">
                <div className="flex flex-wrap gap-2">
                  {orderedWords.map((w, i) => (
                    <Badge
                      key={`${w}-${i}`}
                      variant="default"
                      className="cursor-pointer font-jp text-base"
                      onClick={() => !answered && setOrderedWords(orderedWords.filter((_, idx) => idx !== i))}
                    >
                      {w}
                    </Badge>
                  ))}
                </div>
                {orderedWords.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('grammar.exercise.reorder_hint')}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {current.words.map((w, i) => (
                  <Badge
                    key={`${w}-${i}`}
                    variant="outline"
                    className={`cursor-pointer font-jp text-base ${orderedWords.includes(w) ? 'opacity-30' : ''}`}
                    onClick={() => handleWordClick(w, i)}
                  >
                    {w}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 rounded-lg p-4 ${
              isCorrect
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-200'
                : 'bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-200'
            }`}
          >
            {isCorrect ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0" />}
            <div>
              <p className="font-medium">{isCorrect ? t('grammar.exercise.correct') : t('grammar.exercise.incorrect')}</p>
              <p className="mt-1 text-sm opacity-80">{current.explanation}</p>
            </div>
          </motion.div>
        )}

        <div className="flex justify-end gap-3">
          {!answered ? (
            <Button onClick={checkAnswer} disabled={!userAnswer && orderedWords.length === 0}>
              {t('grammar.exercise.check')}
            </Button>
          ) : idx + 1 < exercises.length ? (
            <Button onClick={handleNext}>
              {t('grammar.exercise.next')} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" onClick={handleReset}>
              {t('typing.restart')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
