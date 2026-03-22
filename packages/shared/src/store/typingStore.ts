import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TypingResult } from '../types/learn'

interface TypingState {
  mode: string
  difficulty: string
  currentText: string
  userInput: string
  startTime: number | null
  wpm: number
  accuracy: number
  errors: number
  isActive: boolean
  results: TypingResult[]
  startPractice: (text: string, mode: string) => void
  updateInput: (input: string) => void
  calculateStats: () => void
  finishPractice: () => void
  reset: () => void
}

export const useTypingStore = create<TypingState>()(
  persist(
    (set, get) => ({
      mode: '',
      difficulty: 'easy',
      currentText: '',
      userInput: '',
      startTime: null,
      wpm: 0,
      accuracy: 100,
      errors: 0,
      isActive: false,
      results: [],

      startPractice: (text: string, mode: string) =>
        set({
          currentText: text,
          mode,
          userInput: '',
          startTime: Date.now(),
          wpm: 0,
          accuracy: 100,
          errors: 0,
          isActive: true,
        }),

      updateInput: (input: string) => {
        set({ userInput: input })
        get().calculateStats()
      },

      calculateStats: () =>
        set((state) => {
          if (!state.startTime || !state.isActive) return state

          const elapsed = (Date.now() - state.startTime) / 1000 / 60
          if (elapsed <= 0) return state

          const typed = state.userInput.length
          const wpm = Math.round(typed / 5 / elapsed)

          let errors = 0
          for (let i = 0; i < state.userInput.length; i++) {
            if (state.userInput[i] !== state.currentText[i]) {
              errors++
            }
          }

          const accuracy =
            typed > 0 ? Math.round(((typed - errors) / typed) * 100) : 100

          return { wpm, accuracy, errors }
        }),

      finishPractice: () =>
        set((state) => {
          const elapsed = state.startTime
            ? (Date.now() - state.startTime) / 1000
            : 0

          const result: TypingResult = {
            wpm: state.wpm,
            accuracy: state.accuracy,
            time: elapsed,
            errors: state.errors,
            total: state.currentText.length,
          }

          return {
            isActive: false,
            results: [...state.results, result],
          }
        }),

      reset: () =>
        set({
          mode: '',
          currentText: '',
          userInput: '',
          startTime: null,
          wpm: 0,
          accuracy: 100,
          errors: 0,
          isActive: false,
        }),
    }),
    {
      name: 'typing-storage',
      partialize: (state) => ({ results: state.results }),
    }
  )
)
