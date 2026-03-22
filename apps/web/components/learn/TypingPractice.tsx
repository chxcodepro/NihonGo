'use client'

import { useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, Input } from '@repo/ui'
import { useTypingStore } from '@repo/shared/store/typingStore'
import type { TypingResult } from '@repo/shared'

interface TypingPracticeProps {
  text: string
  onComplete: (result: TypingResult) => void
}

export function TypingPractice({ text, onComplete }: TypingPracticeProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { userInput, updateInput, finishPractice, wpm, accuracy, errors, startTime } = useTypingStore()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateInput(value)

    if (value.length >= text.length) {
      finishPractice()
      const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0
      onComplete({ wpm, accuracy, time: elapsed, errors, total: text.length })
    }
  }, [text, updateInput, finishPractice, startTime, wpm, accuracy, errors, onComplete])

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="rounded-lg bg-muted/50 p-6">
          <div className="flex flex-wrap text-2xl font-jp leading-relaxed">
            {text.split('').map((char, i) => {
              let className = 'transition-colors'
              if (i < userInput.length) {
                if (userInput[i] === char) {
                  className += ' text-emerald-600 dark:text-emerald-400'
                } else {
                  className += ' text-red-500 bg-red-100 dark:bg-red-950/30 rounded'
                }
              } else if (i === userInput.length) {
                className += ' underline font-bold text-foreground'
              } else {
                className += ' text-muted-foreground'
              }
              return (
                <span key={i} className={className}>{char}</span>
              )
            })}
          </div>
        </div>

        <Input
          ref={inputRef}
          value={userInput}
          onChange={handleChange}
          placeholder="在此输入..."
          className="text-xl font-mono"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>已输入 {userInput.length} / {text.length} 字符</span>
          <span>错误 {errors} 个</span>
        </div>
      </CardContent>
    </Card>
  )
}
