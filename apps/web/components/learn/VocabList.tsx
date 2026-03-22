'use client'

import { useState, useMemo } from 'react'
import { Input } from '@repo/ui'
import type { VocabItem, JlptLevel } from '@repo/shared'
import { vocabN5Data } from '@repo/question-bank'
import { VocabCard } from './VocabCard'
import { Search } from 'lucide-react'

interface VocabListProps {
  level: JlptLevel
}

export function VocabList({ level }: VocabListProps) {
  const [search, setSearch] = useState('')
  const [flippedId, setFlippedId] = useState<string | null>(null)

  const data = vocabN5Data as unknown as VocabItem[]

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(
      (v) =>
        v.word.includes(q) ||
        v.reading.includes(q) ||
        v.romaji.toLowerCase().includes(q) ||
        v.meaningZh.includes(q)
    )
  }, [data, search])

  return (
    <div className="space-y-6">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索词汇（日语、罗马音或中文）"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          没有找到匹配的词汇
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vocab) => (
            <div key={vocab.id} className="flex justify-center">
              <VocabCard
                vocab={vocab}
                isFlipped={flippedId === vocab.id}
                onFlip={() => setFlippedId(flippedId === vocab.id ? null : vocab.id)}
              />
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        共 {filtered.length} 个词汇
      </p>
    </div>
  )
}
