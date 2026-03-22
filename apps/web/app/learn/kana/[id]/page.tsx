'use client'

import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, CardContent, Badge } from '@repo/ui'
import type { KanaItem } from '@repo/shared'
import { hiraganaData, katakanaData, kanaMemoryTips } from '@repo/question-bank'
import { StrokeAnimation } from '@/components/learn/StrokeAnimation'
import { WritingPad } from '@/components/learn/WritingPad'
import { ArrowLeft, ArrowRight, Volume2, ChevronLeft } from 'lucide-react'

const tips = kanaMemoryTips as Record<string, string>
const allHiragana = hiraganaData as unknown as KanaItem[]
const allKatakana = katakanaData as unknown as KanaItem[]
const allKana = [...allHiragana, ...allKatakana]

export default function KanaDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const kana = useMemo(() => allKana.find((k) => k.id === id) || null, [id])

  const isHiragana = id.startsWith('hiragana_')
  const sameTypeList = isHiragana ? allHiragana : allKatakana
  const currentIndex = sameTypeList.findIndex((k) => k.id === id)

  const pair = useMemo(() => {
    if (!kana) return null
    const searchIn = isHiragana ? allKatakana : allHiragana
    return searchIn.find((k) => k.romaji === kana.romaji) || null
  }, [kana, isHiragana])

  const prevKana = currentIndex > 0 ? sameTypeList[currentIndex - 1] : null
  const nextKana = currentIndex < sameTypeList.length - 1 ? sameTypeList[currentIndex + 1] : null

  const handleTTS = (char: string) => {
    const utterance = new SpeechSynthesisUtterance(char)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  if (!kana) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-4xl opacity-20">?</p>
          <p className="mt-4 text-muted-foreground">未找到该假名</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/learn/kana')}>
            返回五十音图
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/learn/kana')}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          五十音图
        </Button>
        <Badge variant="secondary">
          {isHiragana ? '平假名' : '片假名'} · {kana.romaji}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <div className="mb-2 text-sm text-muted-foreground">
                {isHiragana ? '平假名' : '片假名'}
              </div>
              <StrokeAnimation char={kana.char} size={180} autoPlay />
              <div className="mt-3 flex items-center gap-2">
                <span className="font-jp text-3xl">{kana.char}</span>
                <Button variant="ghost" size="sm" onClick={() => handleTTS(kana.char)}>
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-lg text-muted-foreground">{kana.romaji}</p>
            </CardContent>
          </Card>

          {pair && (
            <Card>
              <CardContent className="flex flex-col items-center p-6">
                <div className="mb-2 text-sm text-muted-foreground">
                  {isHiragana ? '片假名' : '平假名'}
                </div>
                <StrokeAnimation char={pair.char} size={140} autoPlay={false} />
                <div className="mt-3 flex items-center gap-2">
                  <span className="font-jp text-2xl">{pair.char}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleTTS(pair.char)}>
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1"
                  onClick={() => router.push(`/learn/kana/${pair.id}`)}
                >
                  查看详情
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">记忆方法</h3>
              <div className="rounded-lg bg-accent/50 p-4">
                <p className="text-base leading-relaxed">
                  {tips[kana.id] || '暂无记忆方法'}
                </p>
              </div>

              {pair && (
                <div className="mt-3 rounded-lg bg-secondary/50 p-4">
                  <p className="mb-1 text-xs text-muted-foreground">
                    {isHiragana ? '片假名' : '平假名'}记忆
                  </p>
                  <p className="text-sm leading-relaxed">
                    {tips[pair.id] || '暂无记忆方法'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">对照表</h3>
              <div className="flex items-center justify-center gap-6 rounded-lg bg-muted/30 py-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">平假名</p>
                  <p className="mt-1 font-jp text-3xl">
                    {isHiragana ? kana.char : pair?.char || '-'}
                  </p>
                </div>
                <div className="text-2xl text-muted-foreground">=</div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">片假名</p>
                  <p className="mt-1 font-jp text-3xl">
                    {isHiragana ? pair?.char || '-' : kana.char}
                  </p>
                </div>
                <div className="text-2xl text-muted-foreground">=</div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">罗马音</p>
                  <p className="mt-1 text-2xl font-medium">{kana.romaji}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">手写练习</h3>
              <WritingPad guideChar={kana.char} size={260} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="outline"
          disabled={!prevKana}
          onClick={() => prevKana && router.push(`/learn/kana/${prevKana.id}`)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {prevKana ? prevKana.char : ''}
        </Button>

        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {sameTypeList.length}
        </span>

        <Button
          variant="outline"
          disabled={!nextKana}
          onClick={() => nextKana && router.push(`/learn/kana/${nextKana.id}`)}
        >
          {nextKana ? nextKana.char : ''}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
