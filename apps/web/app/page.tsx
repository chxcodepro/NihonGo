'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Keyboard, Gamepad2, Bot } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageWrapper } from '@/components/layout/PageWrapper'

const CHARS_A = [
  { char: 'あ', size: 'text-5xl md:text-7xl' },
  { char: 'い', size: 'text-4xl md:text-6xl' },
  { char: 'う', size: 'text-4xl md:text-5xl' },
  { char: 'え', size: 'text-3xl md:text-5xl' },
  { char: 'お', size: 'text-4xl md:text-6xl' },
  { char: '日', size: 'text-3xl md:text-4xl' },
  { char: '本', size: 'text-3xl md:text-4xl' },
  { char: '語', size: 'text-4xl md:text-5xl' },
  { char: 'か', size: 'text-3xl md:text-4xl' },
]

const CHARS_B = [
  { char: 'さ', size: 'text-3xl md:text-5xl' },
  { char: 'き', size: 'text-4xl md:text-5xl' },
  { char: 'す', size: 'text-3xl md:text-4xl' },
  { char: 'せ', size: 'text-4xl md:text-6xl' },
  { char: 'そ', size: 'text-3xl md:text-4xl' },
  { char: '学', size: 'text-3xl md:text-5xl' },
  { char: '話', size: 'text-3xl md:text-5xl' },
  { char: '文', size: 'text-3xl md:text-4xl' },
  { char: '字', size: 'text-4xl md:text-5xl' },
]

function randomPos() {
  let x: number, y: number
  do {
    x = Math.round(Math.random() * 90 + 3)
    y = Math.round(Math.random() * 85 + 3)
  } while (x > 25 && x < 75 && y > 28 && y < 72)
  return { x, y }
}

function generateGroup(chars: typeof CHARS_A) {
  return chars.map((item) => ({
    ...item,
    ...randomPos(),
    delay: +(Math.random() * 3).toFixed(1),
  }))
}

const TYPEWRITER_LINES = [
  '从「あ」开始，开启你的日语学习之旅',
  '每天进步一点点，日语不再难',
  '五十音是日语的基石，一起来掌握吧',
  '千里之行，始于「あいうえお」',
  '用 AI 助力，让学习事半功倍',
  '一言（ひとこと）から、世界が広がる',
]

const TYPEWRITER_TRACK_LINE = TYPEWRITER_LINES.reduce((longest, line) => (
  line.length > longest.length ? line : longest
), '')

function easeInOutCubic(progress: number) {
  if (progress < 0.5) {
    return 4 * progress * progress * progress
  }
  return 1 - Math.pow(-2 * progress + 2, 3) / 2
}

function useTypewriter(lines: string[], typingSpeed = 90, deletingSpeed = 70, pauseMs = 3000) {
  const [lineIndex, setLineIndex] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting'>('typing')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (lines.length === 0) {
      return
    }

    const currentLine = lines[lineIndex] ?? ''
    const lineLength = Math.max(currentLine.length, 1)
    const duration =
      phase === 'typing'
        ? lineLength * typingSpeed
        : phase === 'deleting'
          ? lineLength * deletingSpeed
          : pauseMs

    let frameId = 0
    let startTime: number | null = null

    const from = phase === 'deleting' ? 1 : 0
    const to = phase === 'typing' ? 1 : phase === 'deleting' ? 0 : 1

    const tick = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp
      }

      const elapsed = timestamp - startTime
      const rawProgress = Math.min(elapsed / duration, 1)

      if (phase === 'pause') {
        setProgress(1)
      } else {
        const easedProgress = easeInOutCubic(rawProgress)
        setProgress(from + (to - from) * easedProgress)
      }

      if (rawProgress < 1) {
        frameId = requestAnimationFrame(tick)
        return
      }

      if (phase === 'typing') {
        setPhase('pause')
        return
      }

      if (phase === 'pause') {
        setPhase('deleting')
        return
      }

      setProgress(0)
      setPhase('typing')
      setLineIndex((i) => (i + 1) % lines.length)
    }

    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [deletingSpeed, lineIndex, lines, pauseMs, phase, typingSpeed])

  return {
    currentLine: lines[lineIndex] ?? '',
    progress,
  }
}

export default function HomePage() {
  const { currentLine, progress } = useTypewriter(TYPEWRITER_LINES)
  const revealWidth = `${Math.max(0, Math.min(progress, 1)) * 100}%`
  const typewriterFontStyle = { fontFamily: '"Noto Sans SC", "Noto Sans JP", sans-serif' } as const

  const [activeGroup, setActiveGroup] = useState<'a' | 'b'>('a')
  const [groupA, setGroupA] = useState<ReturnType<typeof generateGroup>>([])
  const [groupB, setGroupB] = useState<ReturnType<typeof generateGroup>>([])

  useEffect(() => {
    setGroupA(generateGroup(CHARS_A))
    setGroupB(generateGroup(CHARS_B))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveGroup((g) => g === 'a' ? 'b' : 'a')
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden hero-gradient grain-overlay">
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <Navbar transparent />
        <div className="flex min-h-0 flex-1 flex-col">
          <PageWrapper className="flex flex-1 flex-col">
            <main className="flex flex-1 flex-col overflow-x-hidden">
              {/* ===== Hero ===== */}
              <section className="relative flex flex-1 items-center py-12 md:py-16">
                <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
                  {groupA.map((item, i) => (
                    <span
                      key={`a-${i}`}
                      className={`absolute font-jp font-bold text-primary ${item.size} ${i % 2 === 0 ? 'animate-float' : 'animate-float-reverse'} transition-opacity duration-[1500ms]`}
                      style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        animationDelay: `${item.delay}s`,
                        opacity: activeGroup === 'a' ? 'var(--floating-char-opacity)' : 0,
                      }}
                    >
                      {item.char}
                    </span>
                  ))}
                  {groupB.map((item, i) => (
                    <span
                      key={`b-${i}`}
                      className={`absolute font-jp font-bold text-primary ${item.size} ${i % 2 === 0 ? 'animate-float' : 'animate-float-reverse'} transition-opacity duration-[1500ms]`}
                      style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        animationDelay: `${item.delay}s`,
                        opacity: activeGroup === 'b' ? 'var(--floating-char-opacity)' : 0,
                      }}
                    >
                      {item.char}
                    </span>
                  ))}
                </div>

                <div className="container relative z-10 mx-auto px-4 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-sm text-cyan-600 dark:text-cyan-400"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    AI 驱动的日语学习平台
                  </motion.div>

                  <motion.h1
                    className="text-5xl font-extrabold leading-none tracking-tight md:text-7xl lg:text-8xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  >
                    <span
                      className="animate-gradient-text bg-clip-text text-transparent"
                      style={{
                        backgroundImage: 'linear-gradient(to right, var(--color-primary), #fb7185, #fbbf24, #a78bfa, var(--color-primary))',
                      }}
                    >
                      NihonGo
                    </span>
                  </motion.h1>

                  <motion.div
                    className="mx-auto mt-6 h-8 max-w-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <p className="flex justify-center text-lg font-light text-muted-foreground md:text-xl">
                      <span
                        className="relative inline-block min-h-8 max-w-full align-middle text-center"
                        style={typewriterFontStyle}
                      >
                        <span className="invisible select-none whitespace-pre">
                          {TYPEWRITER_TRACK_LINE || ' '}
                        </span>
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 top-0 flex justify-center whitespace-pre"
                        >
                          <span className="relative inline-block whitespace-pre">
                            <span className="invisible select-none whitespace-pre">
                              {currentLine || ' '}
                            </span>
                            <span
                              aria-hidden="true"
                              className="absolute left-0 top-0 overflow-hidden whitespace-pre"
                              style={{ width: revealWidth }}
                            >
                              {currentLine}
                            </span>
                            <span
                              aria-hidden="true"
                              className="absolute top-1/2 inline-block h-5 w-[2px] animate-cursor-float bg-primary"
                              style={{ left: revealWidth }}
                            />
                          </span>
                        </span>
                      </span>
                    </p>
                  </motion.div>

                  <motion.div
                    className="mt-10 flex flex-wrap items-center justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Link href="/learn" className="group flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-3 transition-all hover:border-primary/40 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-primary">学习</span>
                    </Link>
                    <Link href="/learn/typing" className="group flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-6 py-3 transition-all hover:border-amber-500/40 hover:bg-amber-500/10 hover:shadow-lg hover:shadow-amber-500/10">
                      <Keyboard className="h-5 w-5 text-amber-500" />
                      <span className="font-semibold text-amber-500">打字练习</span>
                    </Link>
                    <Link href="/game" className="group flex items-center gap-3 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 px-6 py-3 transition-all hover:border-fuchsia-500/40 hover:bg-fuchsia-500/10 hover:shadow-lg hover:shadow-fuchsia-500/10">
                      <Gamepad2 className="h-5 w-5 text-fuchsia-500" />
                      <span className="font-semibold text-fuchsia-500">小游戏</span>
                    </Link>
                  </motion.div>
                </div>
              </section>
            </main>
          </PageWrapper>
        </div>
        <Footer />
      </div>
    </div>
  )
}
