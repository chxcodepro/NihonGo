'use client'

import { Volume2, Loader2 } from 'lucide-react'
import { Button } from '@repo/ui'
import { useTTS } from '@/hooks/useTTS'

interface TTSButtonProps {
  text: string
  lang?: 'ja' | 'zh' | 'en'
  className?: string
}

const langMap: Record<string, string> = {
  ja: 'ja-JP',
  zh: 'zh-CN',
  en: 'en-US',
}

export function TTSButton({ text, lang = 'ja', className }: TTSButtonProps) {
  const { speak, isSpeaking } = useTTS()
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      disabled={!supported || isSpeaking}
      onClick={() => speak(text, langMap[lang])}
    >
      {isSpeaking ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      <span className="sr-only">朗读</span>
    </Button>
  )
}
