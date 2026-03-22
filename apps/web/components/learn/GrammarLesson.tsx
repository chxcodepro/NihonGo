'use client'

import { Card, CardContent, Badge } from '@repo/ui'
import type { GrammarItem } from '@repo/shared'
import { BookOpen, Lightbulb } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface GrammarLessonProps {
  grammar: GrammarItem | null
}

export function GrammarLesson({ grammar }: GrammarLessonProps) {
  const { t } = useTranslation('learn')

  if (!grammar) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <BookOpen className="mb-3 h-12 w-12 opacity-30" />
          <p>{t('grammar.empty')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold font-jp">{grammar.title}</h2>
          <Badge className="mt-2">{grammar.meaning}</Badge>
        </div>

        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          <p className="font-medium text-muted-foreground">{t('grammar.structure')}</p>
          <p className="mt-2 text-lg">{grammar.structure}</p>
        </div>

        <div>
          <h3 className="mb-2 font-medium">{t('grammar.explanation')}</h3>
          <p className="leading-relaxed text-muted-foreground">{grammar.explanation}</p>
        </div>

        <div>
          <h3 className="mb-3 font-medium">{t('grammar.examples')}</h3>
          <div className="space-y-3">
            {grammar.examples.map((ex, i) => (
              <div key={i} className="rounded-lg border p-4">
                <p className="text-lg font-jp">{ex.japanese}</p>
                <p className="mt-1 text-sm text-muted-foreground font-jp">{ex.reading}</p>
                <p className="mt-1 text-sm">{ex.meaning}</p>
              </div>
            ))}
          </div>
        </div>

        {grammar.notes && (
          <div className="flex gap-3 rounded-lg bg-amber-50 p-4 dark:bg-amber-950/20">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">{t('grammar.notes')}</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{grammar.notes}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
