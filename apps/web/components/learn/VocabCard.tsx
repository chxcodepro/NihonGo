'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, Badge, Button } from '@repo/ui'
import type { VocabItem } from '@repo/shared'
import { Volume2 } from 'lucide-react'

interface VocabCardProps {
  vocab: VocabItem
  isFlipped: boolean
  onFlip: () => void
}

export function VocabCard({ vocab, isFlipped, onFlip }: VocabCardProps) {
  const handleTTS = (e: React.MouseEvent) => {
    e.stopPropagation()
    const utterance = new SpeechSynthesisUtterance(vocab.word)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  return (
    <div className="h-64 w-full max-w-md cursor-pointer [perspective:1000px]" onClick={onFlip}>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Card className="flex h-full flex-col items-center justify-center border-2 hover:border-sakura-300">
            <CardContent className="flex flex-col items-center gap-3 p-6">
              <p className="text-3xl font-jp font-bold">{vocab.word}</p>
              <p className="text-lg text-muted-foreground font-jp">{vocab.reading}</p>
              <Button variant="ghost" size="sm" onClick={handleTTS}>
                <Volume2 className="h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground">点击翻转查看释义</p>
            </CardContent>
          </Card>
        </div>

        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <Card className="flex h-full flex-col items-center justify-center border-2 border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20">
            <CardContent className="space-y-3 p-6 text-center">
              <Badge variant="outline">{vocab.partOfSpeech}</Badge>
              <p className="text-xl font-bold">{vocab.meaningZh}</p>
              {vocab.examples.length > 0 && (
                <div className="mt-2 space-y-1 text-sm">
                  <p className="font-jp">{vocab.examples[0].japanese}</p>
                  <p className="text-muted-foreground">{vocab.examples[0].meaning}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">点击翻回正面</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
