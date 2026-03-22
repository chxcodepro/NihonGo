'use client'

import { useState, useEffect, useCallback } from 'react'

interface StrokeData {
  d: string
  id: string
}

interface StrokeAnimationProps {
  char: string
  size?: number
  autoPlay?: boolean
  className?: string
}

const svgCache = new Map<string, StrokeData[]>()

async function fetchStrokes(char: string): Promise<StrokeData[]> {
  const hex = char.charCodeAt(0).toString(16).padStart(5, '0')
  if (svgCache.has(hex)) return svgCache.get(hex)!

  const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Not found')

  const svgText = await res.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgText, 'image/svg+xml')

  const strokes: StrokeData[] = []
  doc.querySelectorAll('path').forEach((p) => {
    const id = p.getAttribute('id') || ''
    const d = p.getAttribute('d') || ''
    if (id.includes('-s') && d) {
      strokes.push({ d, id })
    }
  })

  strokes.sort((a, b) => {
    const numA = parseInt(a.id.split('-s').pop() || '0')
    const numB = parseInt(b.id.split('-s').pop() || '0')
    return numA - numB
  })

  svgCache.set(hex, strokes)
  return strokes
}

export function StrokeAnimation({ char, size = 200, autoPlay = true, className }: StrokeAnimationProps) {
  const [strokes, setStrokes] = useState<StrokeData[]>([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setRevealedCount(0)
    setIsAnimating(false)

    fetchStrokes(char)
      .then((data) => {
        setStrokes(data)
        setLoading(false)
        if (autoPlay && data.length > 0) {
          setIsAnimating(true)
        }
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [char, autoPlay])

  useEffect(() => {
    if (!isAnimating || revealedCount >= strokes.length) {
      if (revealedCount >= strokes.length && strokes.length > 0) {
        setIsAnimating(false)
      }
      return
    }

    const timer = setTimeout(() => {
      setRevealedCount((c) => c + 1)
    }, 650)

    return () => clearTimeout(timer)
  }, [isAnimating, revealedCount, strokes.length])

  const replay = useCallback(() => {
    setRevealedCount(0)
    setIsAnimating(true)
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className || ''}`} style={{ width: size, height: size }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !strokes.length) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border bg-card font-jp text-6xl ${className || ''}`}
        style={{ width: size, height: size }}
      >
        {char}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className || ''}`}>
      <svg
        viewBox="0 0 109 109"
        width={size}
        height={size}
        className="rounded-xl border bg-white dark:bg-zinc-900"
      >
        <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="currentColor" className="text-border" strokeWidth="0.5" strokeDasharray="3 3" />
        <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="currentColor" className="text-border" strokeWidth="0.5" strokeDasharray="3 3" />

        {strokes.map((s, i) => {
          if (i >= revealedCount) return null
          const isLatest = i === revealedCount - 1 && isAnimating
          return (
            <path
              key={isLatest ? `anim-${i}-${revealedCount}` : `done-${i}`}
              d={s.d}
              fill="none"
              stroke={isLatest ? 'var(--sakura)' : 'currentColor'}
              className={isLatest ? '' : 'text-foreground'}
              strokeWidth={isLatest ? 4 : 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={
                isLatest
                  ? {
                      strokeDasharray: 500,
                      strokeDashoffset: 500,
                      animation: 'kana-draw-stroke 0.55s ease forwards',
                    }
                  : undefined
              }
            />
          )
        })}
      </svg>

      <button
        onClick={replay}
        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-3.068 0H4.534a.25.25 0 0 0-.192.41l1.966 2.36a.25.25 0 0 0 .384 0l1.966-2.36A.25.25 0 0 0 8.466 7z" />
        </svg>
        重播笔画
      </button>
    </div>
  )
}
