'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@repo/ui'
import type { KanaItem } from '@repo/shared'
import { hiraganaData, katakanaData } from '@repo/question-bank'
import { useLearnStore } from '@repo/shared/store/learnStore'

interface KanaChartProps {
  type: 'hiragana' | 'katakana' | 'all'
  onSelect: (kana: KanaItem) => void
  selectedId?: string
}

const ROW_LABELS = ['あ行', 'か行', 'さ行', 'た行', 'な行', 'は行', 'ま行', 'や行', 'ら行', 'わ行']

export function KanaChart({ type, onSelect, selectedId }: KanaChartProps) {
  const { masteredKana } = useLearnStore()

  const data = useMemo(() => {
    const raw = type === 'katakana' ? katakanaData : hiraganaData
    return raw as unknown as KanaItem[]
  }, [type])

  const rows = useMemo(() => {
    const grouped: Record<string, KanaItem[]> = {}
    for (const kana of data) {
      if (!grouped[kana.row]) grouped[kana.row] = []
      grouped[kana.row].push(kana)
    }
    return Object.entries(grouped)
  }, [data])

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          {type === 'hiragana' ? '平假名' : '片假名'}
        </h3>
        <div className="space-y-1">
          {rows.map(([rowName, kanas], rowIdx) => (
            <div key={rowName} className="flex items-center gap-1">
              <div className="w-12 shrink-0 text-right text-xs text-muted-foreground">
                {ROW_LABELS[rowIdx] || rowName}
              </div>
              <div className="grid flex-1 grid-cols-5 gap-1 sm:grid-cols-10">
                {kanas.map((kana) => {
                  const isMastered = masteredKana.includes(kana.id)
                  const isSelected = selectedId === kana.id

                  return (
                    <motion.button
                      key={kana.id}
                      onClick={() => onSelect(kana)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex aspect-square items-center justify-center rounded-lg border text-lg font-jp transition-colors
                        ${isSelected
                          ? 'border-sakura-500 bg-sakura-50 text-sakura-700 dark:bg-sakura-950/30 dark:text-sakura-300'
                          : isMastered
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300'
                            : 'border-border bg-background hover:border-sakura-300 hover:bg-sakura-50/50'
                        }`}
                    >
                      {kana.char}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
