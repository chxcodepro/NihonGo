'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Card, CardContent, Progress } from '@repo/ui'
import type { VocabItem } from '@repo/shared'
import { VocabCard } from './VocabCard'
import { PartyPopper } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface VocabReviewProps {
  vocabData: VocabItem[]
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function VocabReview({ vocabData }: VocabReviewProps) {
  const { t } = useTranslation('learn')
  const cards = useMemo(() => shuffleArray(vocabData).slice(0, 10), [vocabData])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [stats, setStats] = useState({ forgot: 0, fuzzy: 0, remembered: 0 })
  const [done, setDone] = useState(false)

  const handleResponse = (type: 'forgot' | 'fuzzy' | 'remembered') => {
    setStats((s) => ({ ...s, [type]: s[type] + 1 }))
    setIsFlipped(false)

    if (currentIdx + 1 >= cards.length) {
      setDone(true)
    } else {
      setTimeout(() => setCurrentIdx((i) => i + 1), 300)
    }
  }

  if (done) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="space-y-6 py-12 text-center">
          <PartyPopper className="mx-auto h-16 w-16 text-amber-500" />
          <h2 className="text-2xl font-bold">{t('vocabulary.review_complete')}</h2>
          <div className="flex justify-center gap-6 text-sm">
            <div>
              <p className="text-2xl font-bold text-emerald-500">{stats.remembered}</p>
              <p className="text-muted-foreground">{t('vocabulary.good')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">{stats.fuzzy}</p>
              <p className="text-muted-foreground">{t('vocabulary.hard')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{stats.forgot}</p>
              <p className="text-muted-foreground">{t('vocabulary.forgot')}</p>
            </div>
          </div>
          <Button onClick={() => { setCurrentIdx(0); setDone(false); setIsFlipped(false); setStats({ forgot: 0, fuzzy: 0, remembered: 0 }) }}>
            {t('vocabulary.review_again')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const current = cards[currentIdx]
  if (!current) return null

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t('vocabulary.card_label')} {currentIdx + 1} / {cards.length}</span>
        <span>{t('vocabulary.good')} {stats.remembered} | {t('vocabulary.hard')} {stats.fuzzy} | {t('vocabulary.forgot')} {stats.forgot}</span>
      </div>

      <Progress value={((currentIdx + 1) / cards.length) * 100} className="h-1.5" />

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="flex justify-center"
        >
          <VocabCard
            vocab={current}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        </motion.div>
      </AnimatePresence>

      {!isFlipped ? (
        <p className="text-center text-sm text-muted-foreground">{t('vocabulary.flip_hint')}</p>
      ) : (
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => handleResponse('forgot')}
          >
            {t('vocabulary.forgot')}
          </Button>
          <Button
            variant="outline"
            className="border-amber-300 text-amber-600 hover:bg-amber-50"
            onClick={() => handleResponse('fuzzy')}
          >
            {t('vocabulary.hard')}
          </Button>
          <Button
            variant="outline"
            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
            onClick={() => handleResponse('remembered')}
          >
            {t('vocabulary.good')}
          </Button>
        </div>
      )}
    </div>
  )
}
