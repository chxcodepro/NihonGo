'use client'

import { useEffect, useCallback } from 'react'

interface SokobanBoardProps {
  grid: number[][]
  playerPos: { x: number; y: number }
  boxes: { x: number; y: number; label?: string }[]
  targets: { x: number; y: number }[]
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void
}

const CELL_SIZE = 48

export function SokobanBoard({ grid, playerPos, boxes, targets, onMove }: SokobanBoardProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const keyMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      s: 'down',
      a: 'left',
      d: 'right',
      W: 'up',
      S: 'down',
      A: 'left',
      D: 'right',
    }
    const direction = keyMap[e.key]
    if (direction) {
      e.preventDefault()
      onMove(direction)
    }
  }, [onMove])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!grid || grid.length === 0) return null

  const rows = grid.length
  const cols = grid[0].length

  const isBox = (x: number, y: number) => boxes.some((b) => b.x === x && b.y === y)
  const getBox = (x: number, y: number) => boxes.find((b) => b.x === x && b.y === y)
  const isTarget = (x: number, y: number) => targets.some((t) => t.x === x && t.y === y)
  const isPlayer = (x: number, y: number) => playerPos.x === x && playerPos.y === y

  return (
    <div
      className="grid gap-0 border border-border rounded-lg overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
      }}
    >
      {grid.map((row, y) =>
        row.map((cell, x) => {
          const isWall = cell === 1
          const hasBox = isBox(x, y)
          const hasTarget = isTarget(x, y)
          const hasPlayer = isPlayer(x, y)
          const boxOnTarget = hasBox && hasTarget
          const box = getBox(x, y)

          return (
            <div
              key={`${x}-${y}`}
              className={`relative flex items-center justify-center ${
                isWall
                  ? 'bg-gray-800 dark:bg-gray-600'
                  : 'bg-gray-100 dark:bg-gray-900'
              }`}
              style={{ width: CELL_SIZE, height: CELL_SIZE }}
            >
              {/* 目标位置 */}
              {hasTarget && !boxOnTarget && (
                <div
                  className="absolute w-6 h-6 border-2 border-dashed border-[var(--color-emerald)] rotate-45"
                />
              )}

              {/* 箱子 */}
              {hasBox && (
                <div
                  className={`absolute w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold text-white ${
                    boxOnTarget
                      ? 'bg-[var(--color-emerald)]'
                      : 'bg-amber-500'
                  }`}
                >
                  {box?.label || '文'}
                </div>
              )}

              {/* 玩家 */}
              {hasPlayer && (
                <div className="absolute w-10 h-10 rounded-full bg-[var(--color-sakura)] flex items-center justify-center text-lg">
                  🧑
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
