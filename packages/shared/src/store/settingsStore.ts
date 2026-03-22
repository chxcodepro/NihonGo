import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale, Theme } from '../types/user'

interface SettingsState {
  theme: Theme
  locale: Locale
  dailyGoal: number
  srsNewCardsPerDay: number
  srsReviewLimit: number
  ttsRate: number
  ttsVoice: string
  setTheme: (theme: Theme) => void
  setLocale: (locale: Locale) => void
  updateSettings: (partial: Partial<Omit<SettingsState, 'setTheme' | 'setLocale' | 'updateSettings'>>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      locale: 'zh-CN',
      dailyGoal: 20,
      srsNewCardsPerDay: 20,
      srsReviewLimit: 100,
      ttsRate: 0.9,
      ttsVoice: '',

      setTheme: (theme: Theme) => set({ theme }),
      setLocale: (locale: Locale) => set({ locale }),
      updateSettings: (partial) => set(partial),
    }),
    {
      name: 'settings-storage',
    }
  )
)
