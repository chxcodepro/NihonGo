'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, Badge } from '@repo/ui'
import type { GrammarItem } from '@repo/shared'
import { grammarN5Data } from '@repo/question-bank'
import { GrammarLesson } from '@/components/learn/GrammarLesson'
import { GrammarExercise } from '@/components/learn/GrammarExercise'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function GrammarPage() {
  const { t } = useTranslation('learn')
  const data = grammarN5Data as unknown as GrammarItem[]
  const [selectedId, setSelectedId] = useState<string>(data[0]?.id || '')

  const selected = useMemo(() => data.find((g) => g.id === selectedId) || null, [data, selectedId])

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('grammar.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('grammar.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t('grammar.lesson_list')}</h3>
              <div className="space-y-1">
                {data.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedId(g.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors
                      ${selectedId === g.id
                        ? 'bg-sakura-50 text-sakura-700 dark:bg-sakura-950/30 dark:text-sakura-300'
                        : 'hover:bg-muted'
                      }`}
                  >
                    <ChevronRight className={`h-3 w-3 transition-transform ${selectedId === g.id ? 'rotate-90' : ''}`} />
                    <span className="font-jp">{g.title}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:hidden mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {data.map((g) => (
              <Badge
                key={g.id}
                variant={selectedId === g.id ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap font-jp"
                onClick={() => setSelectedId(g.id)}
              >
                {g.title}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <GrammarLesson grammar={selected} />
          {selected && <GrammarExercise grammarId={selected.id} />}
        </div>
      </div>
    </div>
  )
}
