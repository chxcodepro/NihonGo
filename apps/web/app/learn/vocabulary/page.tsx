'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, Badge, Button } from '@repo/ui'
import { vocabN5Data } from '@repo/question-bank'
import type { VocabItem, JlptLevel } from '@repo/shared'
import { VocabList } from '@/components/learn/VocabList'
import { VocabReview } from '@/components/learn/VocabReview'
import { BookOpen, RotateCcw } from 'lucide-react'

export default function VocabularyPage() {
  const [level, setLevel] = useState<JlptLevel>('N5')
  const [mode, setMode] = useState<'browse' | 'review'>('browse')

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">词汇学习</h1>
          <p className="mt-1 text-sm text-muted-foreground">按JLPT级别系统学习日语词汇</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mode === 'browse' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('browse')}
          >
            <BookOpen className="mr-1 h-4 w-4" />
            浏览模式
          </Button>
          <Button
            variant={mode === 'review' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('review')}
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            复习模式
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {(['N5', 'N4', 'N3', 'N2', 'N1'] as JlptLevel[]).map((l) => (
          <Badge
            key={l}
            variant={level === l ? 'default' : 'outline'}
            className={`cursor-pointer ${l !== 'N5' ? 'opacity-50' : ''}`}
            onClick={() => l === 'N5' && setLevel(l)}
          >
            {l}
            {l !== 'N5' && <span className="ml-1 text-xs">即将推出</span>}
          </Badge>
        ))}
      </div>

      {mode === 'browse' ? (
        <VocabList level={level} />
      ) : (
        <VocabReview vocabData={vocabN5Data as unknown as VocabItem[]} />
      )}
    </div>
  )
}
