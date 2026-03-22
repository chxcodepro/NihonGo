'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@repo/ui'
import { Eraser, RotateCcw } from 'lucide-react'

interface WritingPadProps {
  guideChar?: string
  size?: number
  className?: string
}

export function WritingPad({ guideChar, size = 280, className }: WritingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const strokeHistory = useRef<ImageData[]>([])
  const canvasSize = size * 2

  const drawGuide = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, canvasSize, canvasSize)

      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.setLineDash([8, 8])
      ctx.beginPath()
      ctx.moveTo(canvasSize / 2, 0)
      ctx.lineTo(canvasSize / 2, canvasSize)
      ctx.moveTo(0, canvasSize / 2)
      ctx.lineTo(canvasSize, canvasSize / 2)
      ctx.stroke()
      ctx.setLineDash([])

      if (guideChar) {
        ctx.font = `${canvasSize * 0.65}px "Noto Sans JP", sans-serif`
        ctx.fillStyle = 'rgba(180, 180, 180, 0.2)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(guideChar, canvasSize / 2, canvasSize / 2)
      }
    },
    [guideChar, canvasSize]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvasSize
    canvas.height = canvasSize
    drawGuide(ctx)
    strokeHistory.current = []
  }, [canvasSize, drawGuide])

  const getPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const scale = canvas.width / rect.width
      if ('touches' in e) {
        const touch = e.touches[0]
        if (!touch) return null
        return {
          x: (touch.clientX - rect.left) * scale,
          y: (touch.clientY - rect.top) * scale,
        }
      }
      return {
        x: ((e as React.MouseEvent).clientX - rect.left) * scale,
        y: ((e as React.MouseEvent).clientY - rect.top) * scale,
      }
    },
    []
  )

  const startDraw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (ctx && canvas) {
        strokeHistory.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
      }
      setIsDrawing(true)
      lastPos.current = getPos(e)
    },
    [getPos]
  )

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return
      e.preventDefault()
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx || !lastPos.current) return

      const pos = getPos(e)
      if (!pos) return

      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 6
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()

      lastPos.current = pos
    },
    [isDrawing, getPos]
  )

  const stopDraw = useCallback(() => {
    setIsDrawing(false)
    lastPos.current = null
  }, [])

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    drawGuide(ctx)
    strokeHistory.current = []
  }, [drawGuide])

  const undo = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas || strokeHistory.current.length === 0) return
    const prev = strokeHistory.current.pop()!
    ctx.putImageData(prev, 0, 0)
  }, [])

  return (
    <div className={`flex flex-col items-center gap-3 ${className || ''}`}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="cursor-crosshair touch-none rounded-xl border-2 border-dashed border-border bg-white dark:bg-zinc-900"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={undo}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          撤销
        </Button>
        <Button variant="outline" size="sm" onClick={clear}>
          <Eraser className="mr-1 h-3.5 w-3.5" />
          清除
        </Button>
      </div>
    </div>
  )
}
