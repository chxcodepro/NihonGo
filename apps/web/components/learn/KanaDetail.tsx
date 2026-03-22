'use client'

import { Card, CardContent, Button, Badge } from '@repo/ui'
import type { KanaItem } from '@repo/shared'
import { useLearnStore } from '@repo/shared/store/learnStore'
import { Volume2, Check } from 'lucide-react'

interface KanaDetailProps {
  kana: KanaItem | null
  onMastered: (id: string) => void
}

export function KanaDetail({ kana, onMastered }: KanaDetailProps) {
  const { masteredKana } = useLearnStore()

  const handleTTS = () => {
    if (!kana) return
    const utterance = new SpeechSynthesisUtterance(kana.audioText)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  if (!kana) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <p className="text-4xl opacity-20">あ</p>
          <p className="mt-4">点击假名查看详情</p>
        </CardContent>
      </Card>
    )
  }

  const isMastered = masteredKana.includes(kana.id)

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="text-center">
          <p className="text-kana-lg font-jp">{kana.char}</p>
          <p className="mt-2 text-xl text-muted-foreground">{kana.romaji}</p>
          <Button variant="ghost" size="sm" onClick={handleTTS} className="mt-2">
            <Volume2 className="mr-1 h-4 w-4" />
            发音
          </Button>
        </div>

        <div className="rounded-lg border-2 border-dashed border-muted p-8 text-center text-sm text-muted-foreground">
          笔顺动画
          <p className="mt-1 text-xs">（即将推出）</p>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium">例词</h4>
          <div className="space-y-2">
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <span className="font-jp">{kana.char}さ</span>
              <span className="ml-2 text-sm text-muted-foreground">({kana.romaji}sa)</span>
            </div>
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <span className="font-jp">{kana.char}め</span>
              <span className="ml-2 text-sm text-muted-foreground">({kana.romaji}me)</span>
            </div>
          </div>
        </div>

        <Button
          variant={isMastered ? 'outline' : 'default'}
          className="w-full"
          onClick={() => onMastered(kana.id)}
        >
          {isMastered ? (
            <>
              <Check className="mr-1 h-4 w-4 text-emerald-500" />
              已掌握
            </>
          ) : (
            '标记为已掌握'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
