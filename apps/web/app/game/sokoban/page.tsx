'use client'

import { useState, useCallback, useEffect } from 'react'
import { Box, RotateCcw, Star } from 'lucide-react'
import { Button, Card } from '@repo/ui'
import { useGameStore } from '@repo/shared/store/gameStore'
import { sokobanLevels } from '@repo/question-bank'
import type { SokobanLevel } from '@repo/shared'
import { SokobanBoard } from '@/components/game/SokobanBoard'
import { SokobanQuestion } from '@/components/game/SokobanQuestion'
import { SokobanResult } from '@/components/game/SokobanResult'

export default function SokobanPage() {
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0)
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<SokobanLevel['grammarPoints'][0] | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)

  const { sokoban, loadLevel, movePlayer, checkAnswer, resetLevel } = useGameStore()

  const levels = sokobanLevels ?? []
  const currentLevel = levels[selectedLevelIndex]
  const isPlaying = sokoban.level !== null && !sokoban.completed

  const handleStartLevel = useCallback(() => {
    if (currentLevel) {
      loadLevel(currentLevel as unknown as SokobanLevel)
      setQuestionIndex(0)
      setShowResult(false)
    }
  }, [currentLevel, loadLevel])

  useEffect(() => {
    if (currentLevel) {
      handleStartLevel()
    }
  }, [selectedLevelIndex])

  const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    movePlayer(direction)
    if (currentLevel) {
      const gp = currentLevel.grammarPoints[questionIndex % currentLevel.grammarPoints.length]
      if (gp) {
        setCurrentQuestion(gp)
        setShowQuestion(true)
      }
    }
  }, [movePlayer, currentLevel, questionIndex])

  const handleAnswer = useCallback((correct: boolean) => {
    checkAnswer(correct)
    setQuestionIndex((prev) => prev + 1)
    setShowQuestion(false)

    if (sokoban.completed) {
      setShowResult(true)
    }
  }, [checkAnswer, sokoban.completed])

  const handleNextLevel = useCallback(() => {
    if (selectedLevelIndex < levels.length - 1) {
      setSelectedLevelIndex((prev) => prev + 1)
      setShowResult(false)
    }
  }, [selectedLevelIndex, levels.length])

  const difficultyStars = currentLevel?.difficulty ?? 1

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
        <Box className="w-8 h-8 text-emerald-500" />
        推箱子记语法
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] gap-6">
        {/* 左侧: 关卡信息 */}
        <Card className="p-4 space-y-4 h-fit">
          <div className="space-y-2">
            <label className="text-sm font-medium">选择关卡</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={String(selectedLevelIndex)}
              onChange={(e) => setSelectedLevelIndex(Number(e.target.value))}
            >
              {levels.map((level, i) => (
                <option key={i} value={String(i)}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">难度</p>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < difficultyStars ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">步数</p>
            <p className="text-lg font-bold">{sokoban.moves}</p>
          </div>

          <Button variant="outline" className="w-full" onClick={() => resetLevel()}>
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
        </Card>

        {/* 中央: 游戏面板 */}
        <div className="flex justify-center">
          {isPlaying && sokoban.level && (
            <SokobanBoard
              grid={sokoban.level.grid}
              playerPos={{ x: sokoban.playerPos[1], y: sokoban.playerPos[0] }}
              boxes={sokoban.boxes.map(([r, c]) => ({ x: c, y: r }))}
              targets={sokoban.level.targets.map(([r, c]) => ({ x: c, y: r }))}
              onMove={handleMove}
            />
          )}
          {!isPlaying && !showResult && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">选择关卡开始游戏</p>
              <Button onClick={handleStartLevel}>开始游戏</Button>
            </Card>
          )}
        </div>

        {/* 右侧: 语法说明 */}
        <Card className="p-4 h-fit">
          <h3 className="font-semibold mb-2">语法提示</h3>
          {currentLevel?.grammarPoints?.[0] ? (
            <div className="text-sm space-y-2">
              <p className="font-medium">{currentLevel.grammarPoints[0].question}</p>
              <p className="text-muted-foreground">{currentLevel.grammarPoints[0].explanation}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">完成关卡后查看语法解析</p>
          )}
        </Card>
      </div>

      {/* 语法问题弹窗 */}
      {showQuestion && currentQuestion && (
        <SokobanQuestion
          question={currentQuestion.question}
          options={currentQuestion.options}
          correctIndex={currentQuestion.correctIndex}
          explanation={currentQuestion.explanation}
          onAnswer={handleAnswer}
        />
      )}

      {/* 通关结果 */}
      {showResult && (
        <SokobanResult
          stars={sokoban.answeredCorrectly >= sokoban.answeredTotal ? 3 : sokoban.answeredCorrectly >= sokoban.answeredTotal * 0.6 ? 2 : 1}
          moves={sokoban.moves}
          correctAnswers={sokoban.answeredCorrectly}
          totalAnswers={sokoban.answeredTotal}
          hasNextLevel={selectedLevelIndex < levels.length - 1}
          onNext={handleNextLevel}
          onRetry={handleStartLevel}
        />
      )}
    </div>
  )
}
