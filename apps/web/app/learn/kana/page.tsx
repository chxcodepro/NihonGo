'use client'

import { useState } from 'react'
import { Button, Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from '@repo/ui'
import type { KanaItem } from '@repo/shared'
import { hiraganaData, katakanaData } from '@repo/question-bank'
import { KanaChart } from '@/components/learn/KanaChart'
import { KanaQuiz } from '@/components/learn/KanaQuiz'
import { useTranslation } from '@/hooks/useTranslation'

export default function KanaPage() {
  const { t } = useTranslation('learn')
  const [quizOpen, setQuizOpen] = useState(false)

  const allData = [...hiraganaData, ...katakanaData]

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('kana.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('kana.subtitle')}</p>
        </div>
        <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
          <DialogTrigger asChild>
            <Button>{t('kana.start_quiz')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('kana.quiz_title')}</DialogTitle>
            </DialogHeader>
            <KanaQuiz kanaData={allData as unknown as KanaItem[]} onClose={() => setQuizOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <p className="mb-5 text-xs text-muted-foreground">点击任意假名查看笔画动画、记忆方法和手写练习</p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <KanaChart type="hiragana" />
        <KanaChart type="katakana" />
      </div>
    </div>
  )
}
