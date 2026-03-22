import { create } from 'zustand'
import type { TypingRaceState, SokobanState, SokobanLevel } from '../types/game'

interface GameState {
  typingRace: TypingRaceState
  sokoban: SokobanState
  startRace: (difficulty: TypingRaceState['difficulty'], text: string) => void
  updatePlayerInput: (input: string) => void
  updateAiProgress: (progress: number) => void
  finishRace: () => void
  loadLevel: (level: SokobanLevel) => void
  movePlayer: (direction: 'up' | 'down' | 'left' | 'right') => void
  checkAnswer: (correct: boolean) => void
  resetLevel: () => void
}

const initialTypingRace: TypingRaceState = {
  difficulty: 'easy',
  aiOpponent: '',
  playerProgress: 0,
  aiProgress: 0,
  playerWpm: 0,
  aiWpm: 0,
  playerAccuracy: 100,
  status: 'idle',
  text: '',
  playerInput: '',
  startTime: null,
  result: null,
}

const initialSokoban: SokobanState = {
  level: null,
  playerPos: [0, 0],
  boxes: [],
  moves: 0,
  completed: false,
  stars: 0,
  answeredCorrectly: 0,
  answeredTotal: 0,
}

export const useGameStore = create<GameState>()((set) => ({
  typingRace: initialTypingRace,
  sokoban: initialSokoban,

  startRace: (difficulty, text) =>
    set({
      typingRace: {
        ...initialTypingRace,
        difficulty,
        text,
        status: 'countdown',
        startTime: Date.now(),
      },
    }),

  updatePlayerInput: (input) =>
    set((state) => {
      const elapsed = state.typingRace.startTime
        ? (Date.now() - state.typingRace.startTime) / 1000 / 60
        : 0
      const wpm = elapsed > 0 ? Math.round(input.length / 5 / elapsed) : 0
      const progress = state.typingRace.text.length > 0
        ? (input.length / state.typingRace.text.length) * 100
        : 0

      let errors = 0
      for (let i = 0; i < input.length; i++) {
        if (input[i] !== state.typingRace.text[i]) errors++
      }
      const accuracy = input.length > 0
        ? Math.round(((input.length - errors) / input.length) * 100)
        : 100

      return {
        typingRace: {
          ...state.typingRace,
          playerInput: input,
          playerProgress: progress,
          playerWpm: wpm,
          playerAccuracy: accuracy,
          status: 'playing',
        },
      }
    }),

  updateAiProgress: (progress) =>
    set((state) => ({
      typingRace: {
        ...state.typingRace,
        aiProgress: progress,
      },
    })),

  finishRace: () =>
    set((state) => {
      const playerWon = state.typingRace.playerProgress >= state.typingRace.aiProgress
      const isDraw = state.typingRace.playerProgress === state.typingRace.aiProgress
      return {
        typingRace: {
          ...state.typingRace,
          status: 'finished',
          result: isDraw ? 'draw' : playerWon ? 'win' : 'lose',
        },
      }
    }),

  loadLevel: (level) =>
    set({
      sokoban: {
        ...initialSokoban,
        level,
        playerPos: level.playerStart,
        boxes: [...level.boxes],
      },
    }),

  movePlayer: (direction) =>
    set((state) => {
      if (!state.sokoban.level || state.sokoban.completed) return state

      const [py, px] = state.sokoban.playerPos
      const delta: Record<string, [number, number]> = {
        up: [-1, 0],
        down: [1, 0],
        left: [0, -1],
        right: [0, 1],
      }
      const [dy, dx] = delta[direction]
      const newPos: [number, number] = [py + dy, px + dx]

      const grid = state.sokoban.level.grid
      if (
        newPos[0] < 0 ||
        newPos[0] >= grid.length ||
        newPos[1] < 0 ||
        newPos[1] >= grid[0].length ||
        grid[newPos[0]][newPos[1]] === 1
      ) {
        return state
      }

      const boxIndex = state.sokoban.boxes.findIndex(
        ([by, bx]) => by === newPos[0] && bx === newPos[1]
      )

      let newBoxes = [...state.sokoban.boxes]
      if (boxIndex >= 0) {
        const newBoxPos: [number, number] = [newPos[0] + dy, newPos[1] + dx]
        if (
          newBoxPos[0] < 0 ||
          newBoxPos[0] >= grid.length ||
          newBoxPos[1] < 0 ||
          newBoxPos[1] >= grid[0].length ||
          grid[newBoxPos[0]][newBoxPos[1]] === 1 ||
          newBoxes.some(([by, bx]) => by === newBoxPos[0] && bx === newBoxPos[1])
        ) {
          return state
        }
        newBoxes = newBoxes.map((b, i) => (i === boxIndex ? newBoxPos : b))
      }

      const targets = state.sokoban.level.targets
      const allOnTarget = targets.every(([ty, tx]) =>
        newBoxes.some(([by, bx]) => by === ty && bx === tx)
      )

      return {
        sokoban: {
          ...state.sokoban,
          playerPos: newPos,
          boxes: newBoxes,
          moves: state.sokoban.moves + 1,
          completed: allOnTarget,
          stars: allOnTarget
            ? state.sokoban.moves + 1 <= 20
              ? 3
              : state.sokoban.moves + 1 <= 40
                ? 2
                : 1
            : state.sokoban.stars,
        },
      }
    }),

  checkAnswer: (correct) =>
    set((state) => ({
      sokoban: {
        ...state.sokoban,
        answeredTotal: state.sokoban.answeredTotal + 1,
        answeredCorrectly: correct
          ? state.sokoban.answeredCorrectly + 1
          : state.sokoban.answeredCorrectly,
      },
    })),

  resetLevel: () =>
    set((state) => {
      if (!state.sokoban.level) return state
      return {
        sokoban: {
          ...initialSokoban,
          level: state.sokoban.level,
          playerPos: state.sokoban.level.playerStart,
          boxes: [...state.sokoban.level.boxes],
        },
      }
    }),
}))
