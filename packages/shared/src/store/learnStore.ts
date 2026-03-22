import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProgressItem } from '../types/learn'

interface LearnState {
  localProgress: Record<string, ProgressItem>
  currentModule: string
  masteredKana: string[]
  updateProgress: (module: string, itemId: string, correct: boolean) => void
  setCurrentModule: (module: string) => void
  markKanaMastered: (id: string) => void
  getProgress: (module: string, itemId: string) => ProgressItem | null
}

export const useLearnStore = create<LearnState>()(
  persist(
    (set, get) => ({
      localProgress: {},
      currentModule: '',
      masteredKana: [],

      updateProgress: (module: string, itemId: string, correct: boolean) =>
        set((state) => {
          const key = `${module}:${itemId}`
          const existing = state.localProgress[key]
          const now = new Date().toISOString()

          if (!existing) {
            return {
              localProgress: {
                ...state.localProgress,
                [key]: {
                  itemId,
                  module,
                  level: correct ? 1 : 0,
                  easeFactor: 2.5,
                  intervalDays: correct ? 1 : 0,
                  nextReview: now,
                  lastReview: now,
                },
              },
            }
          }

          const newLevel = correct
            ? Math.min(existing.level + 1, 5)
            : Math.max(existing.level - 1, 0)

          return {
            localProgress: {
              ...state.localProgress,
              [key]: {
                ...existing,
                level: newLevel,
                lastReview: now,
                nextReview: now,
              },
            },
          }
        }),

      setCurrentModule: (module: string) => set({ currentModule: module }),

      markKanaMastered: (id: string) =>
        set((state) => ({
          masteredKana: state.masteredKana.includes(id)
            ? state.masteredKana
            : [...state.masteredKana, id],
        })),

      getProgress: (module: string, itemId: string) => {
        const key = `${module}:${itemId}`
        return get().localProgress[key] || null
      },
    }),
    {
      name: 'learn-storage',
    }
  )
)
