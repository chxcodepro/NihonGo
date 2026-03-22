import { apiClient } from './client'
import type { TypingRaceState } from '../types/game'

export function getTypingRaceText(
  difficulty: TypingRaceState['difficulty']
): Promise<{ text: string; aiWpm: number }> {
  return apiClient('/game/typing-race/text', { params: { difficulty } })
}

export function submitTypingResult(data: {
  wpm: number
  accuracy: number
  time: number
  difficulty: string
}): Promise<void> {
  return apiClient('/game/typing-race/result', { method: 'POST', body: data })
}

export function getSokobanLevels(): Promise<{ id: string; name: string; difficulty: number }[]> {
  return apiClient('/game/sokoban/levels')
}

export function getSokobanLevel(id: string): Promise<import('../types/game').SokobanLevel> {
  return apiClient(`/game/sokoban/levels/${id}`)
}
