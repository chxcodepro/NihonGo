'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { KanaItem } from '@repo/shared'
import { hiraganaData, katakanaData } from '@repo/question-bank'
import { useLearnStore } from '@repo/shared/store/learnStore'
import { useTranslation } from '@/hooks/useTranslation'

interface KanaChartProps {
  type: 'hiragana' | 'katakana' | 'all'
  onSelect?: (kana: KanaItem) => void
  selectedId?: string
  compact?: boolean
}

const ROW_LABELS = ['あ行', 'か行', 'さ行', 'た行', 'な行', 'は行', 'ま行', 'や行', 'ら行', 'わ行']
const COL_HEADERS = ['a', 'i', 'u', 'e', 'o']
const GRID_CLS = 'grid grid-cols-[2rem_repeat(5,1fr)] gap-x-1.5 sm:grid-cols-[2.5rem_repeat(5,1fr)] sm:gap-x-2'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
}

const rowVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
}

const cellVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 30 },
  },
}

export function KanaChart({ type, onSelect, selectedId, compact = false }: KanaChartProps) {
  const { t } = useTranslation('learn')
  const { masteredKana } = useLearnStore()
  const router = useRouter()

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

  const grid = useMemo(() => {
    return rows.map(([rowName, kanas]) => {
      const cells: (KanaItem | null)[] = Array(5).fill(null)
      for (const kana of kanas) {
        if (kana.column >= 1 && kana.column <= 5) {
          cells[kana.column - 1] = kana
        }
      }
      return { rowName, cells }
    })
  }, [rows])

  const handleClick = (kana: KanaItem) => {
    if (onSelect) onSelect(kana)
    router.push(`/learn/kana/${kana.id}`)
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground">
        {type === 'hiragana' ? t('kana.hiragana') : t('kana.katakana')}
      </h3>

      <div className={GRID_CLS}>
        <div />
        {COL_HEADERS.map((h) => (
          <div key={h} className="pb-1.5 text-center text-xs font-medium text-muted-foreground/60">
            {h}
          </div>
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-1.5 sm:space-y-2"
      >
        {grid.map(({ rowName, cells }, rowIdx) => (
          <motion.div
            key={rowName}
            variants={rowVariants}
            className={GRID_CLS}
          >
            <div className="flex items-center justify-end pr-1 text-[10px] font-medium text-muted-foreground/50 sm:text-xs">
              {ROW_LABELS[rowIdx] || rowName}
            </div>
            {cells.map((kana, colIdx) => {
              if (!kana) {
                return <div key={`empty-${rowIdx}-${colIdx}`} className="aspect-square" />
              }

              const isMastered = masteredKana.includes(kana.id)
              const isSelected = selectedId === kana.id

              return (
                <motion.button
                  key={kana.id}
                  variants={cellVariants}
                  whileHover={{
                    scale: 1.1,
                    transition: { type: 'spring', stiffness: 400, damping: 15 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleClick(kana)}
                  className={`flex aspect-square w-full flex-col items-center justify-center rounded-xl border-2 transition-all duration-200
                    ${isSelected
                      ? 'border-sakura-500 bg-sakura-50 text-sakura-700 shadow-md dark:bg-sakura-950/30 dark:text-sakura-300'
                      : isMastered
                        ? 'border-emerald-300/80 bg-emerald-50/80 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300'
                        : 'border-zinc-300 bg-muted/30 hover:border-sakura-400 hover:bg-sakura-50/60 hover:shadow-sm dark:border-zinc-500 dark:bg-zinc-800/40 dark:hover:border-sakura-400 dark:hover:bg-sakura-950/20'
                    }`}
                >
                  <span className={`font-jp leading-none ${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>
                    {kana.char}
                  </span>
                  <span className="mt-1 text-[9px] leading-none text-muted-foreground sm:text-[10px]">
                    {kana.romaji}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
