'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Card } from '@repo/ui'

interface SokobanQuestionProps {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  onAnswer: (correct: boolean) => void
}

export function SokobanQuestion({
  question,
  options,
  correctIndex,
  explanation,
  onAnswer,
}: SokobanQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleSelect = (index: number) => {
    if (answered) return
    setSelected(index)
    setAnswered(true)
  }

  const handleContinue = () => {
    onAnswer(selected === correctIndex)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-center">{question}</h3>

          <div className="grid grid-cols-2 gap-3">
            {options.map((option, i) => {
              let variant: 'outline' | 'default' | 'destructive' = 'outline'
              let extraClass = ''

              if (answered) {
                if (i === correctIndex) {
                  extraClass = 'border-[var(--color-emerald)] bg-[var(--color-emerald)]/10 text-[var(--color-emerald)]'
                } else if (i === selected && i !== correctIndex) {
                  extraClass = 'border-[var(--color-coral)] bg-[var(--color-coral)]/10 text-[var(--color-coral)]'
                }
              }

              return (
                <motion.div
                  key={i}
                  whileTap={!answered ? { scale: 0.95 } : undefined}
                  animate={
                    answered && i === selected && i !== correctIndex
                      ? { x: [0, -4, 4, -4, 4, 0] }
                      : {}
                  }
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    variant={variant}
                    className={`w-full h-auto py-3 text-base whitespace-normal ${extraClass}`}
                    onClick={() => handleSelect(i)}
                    disabled={answered}
                  >
                    {option}
                  </Button>
                </motion.div>
              )
            })}
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <div className={`p-3 rounded-lg text-sm ${
                  selected === correctIndex
                    ? 'bg-[var(--color-emerald)]/10 border border-[var(--color-emerald)]'
                    : 'bg-[var(--color-coral)]/10 border border-[var(--color-coral)]'
                }`}>
                  <p className="font-medium mb-1">
                    {selected === correctIndex ? '回答正确！' : '回答错误'}
                  </p>
                  <p className="text-muted-foreground">{explanation}</p>
                </div>

                <Button className="w-full" onClick={handleContinue}>
                  继续
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  )
}
