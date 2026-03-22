export interface AppSettings {
  theme: import('./user').Theme
  locale: import('./user').Locale
  dailyGoal: number
  srsNewCardsPerDay: number
  srsReviewLimit: number
  ttsRate: number
  ttsVoice: string
}
