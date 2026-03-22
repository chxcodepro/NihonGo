export type Locale = 'zh-CN' | 'en' | 'ja'
export type Theme = 'light' | 'dark' | 'system'

export interface User {
  id: number
  username: string
  email: string | null
  avatarUrl: string
  locale: Locale
  theme: Theme
  emailVerified: boolean
  oauthProviders: string[]
  settings: UserSettings
  stats: UserStats
  createdAt: string
}

export interface UserSettings {
  aiBaseUrl: string
  aiModel: string
  ttsRate: number
  typingLayout: 'romaji' | 'kana'
  dailyGoal: number
}

export interface UserStats {
  studyDays: number
  totalWords: number
  totalGrammar: number
  streakDays: number
}
