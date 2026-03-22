import zhCommon from './locales/zh-CN/common.json'
import zhNav from './locales/zh-CN/nav.json'
import zhLearn from './locales/zh-CN/learn.json'
import zhGame from './locales/zh-CN/game.json'
import zhAuth from './locales/zh-CN/auth.json'
import zhSettings from './locales/zh-CN/settings.json'
import zhAi from './locales/zh-CN/ai.json'
import zhHome from './locales/zh-CN/home.json'

import enCommon from './locales/en/common.json'
import enNav from './locales/en/nav.json'
import enLearn from './locales/en/learn.json'
import enGame from './locales/en/game.json'
import enAuth from './locales/en/auth.json'
import enSettings from './locales/en/settings.json'
import enAi from './locales/en/ai.json'
import enHome from './locales/en/home.json'

import jaCommon from './locales/ja/common.json'
import jaNav from './locales/ja/nav.json'
import jaLearn from './locales/ja/learn.json'
import jaGame from './locales/ja/game.json'
import jaAuth from './locales/ja/auth.json'
import jaSettings from './locales/ja/settings.json'
import jaAi from './locales/ja/ai.json'
import jaHome from './locales/ja/home.json'

export const locales = ['zh-CN', 'en', 'ja'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'zh-CN'

export type MessageValue = string | { [key: string]: MessageValue }
export type Messages = Record<string, Record<string, MessageValue>>

export const messages: Record<Locale, Messages> = {
  'zh-CN': { common: zhCommon, nav: zhNav, learn: zhLearn, game: zhGame, auth: zhAuth, settings: zhSettings, ai: zhAi, home: zhHome },
  en: { common: enCommon, nav: enNav, learn: enLearn, game: enGame, auth: enAuth, settings: enSettings, ai: enAi, home: enHome },
  ja: { common: jaCommon, nav: jaNav, learn: jaLearn, game: jaGame, auth: jaAuth, settings: jaSettings, ai: jaAi, home: jaHome },
}

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages[defaultLocale]
}
