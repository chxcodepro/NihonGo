export interface GameInfo {
  id: string
  name: string
  description: string
  icon: string
  route: string
}

export interface TypingRaceState {
  difficulty: 'easy' | 'medium' | 'hard'
  aiOpponent: string
  playerProgress: number
  aiProgress: number
  playerWpm: number
  aiWpm: number
  playerAccuracy: number
  status: 'idle' | 'countdown' | 'playing' | 'finished'
  text: string
  playerInput: string
  startTime: number | null
  result: 'win' | 'lose' | 'draw' | null
}

export interface SokobanLevel {
  id: string
  name: string
  difficulty: number
  grid: number[][]
  playerStart: [number, number]
  boxes: [number, number][]
  targets: [number, number][]
  grammarPoints: SokobanGrammar[]
}

export interface SokobanGrammar {
  boxIndex: number
  grammarId: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface SokobanState {
  level: SokobanLevel | null
  playerPos: [number, number]
  boxes: [number, number][]
  moves: number
  completed: boolean
  stars: number
  answeredCorrectly: number
  answeredTotal: number
}
