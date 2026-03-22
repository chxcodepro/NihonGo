'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Button, Card } from '@repo/ui'

interface SokobanResultProps {
  stars: number
  moves: number
  correctAnswers: number
  totalAnswers: number
  hasNextLevel: boolean
  onNext: () => void
  onRetry: () => void
}

export function SokobanResult({
  stars,
  moves,
  correctAnswers,
  totalAnswers,
  hasNextLevel,
  onNext,
  onRetry,
}: SokobanResultProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <Card className="p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold">关卡完成！</h2>

          {/* 星级 */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 + i * 0.15, type: 'spring' }}
              >
                <Star
                  className={`w-10 h-10 ${
                    i < stars
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-gray-300'
                  }`}
                />
              </motion.div>
            ))}
          </div>

          {/* 统计 */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">步数</span>
              <span className="font-bold">{moves}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">正确回答</span>
              <span className="font-bold">{correctAnswers} / {totalAnswers}</span>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onRetry}>
              重新挑战
            </Button>
            {hasNextLevel && (
              <Button className="flex-1" onClick={onNext}>
                下一关
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
