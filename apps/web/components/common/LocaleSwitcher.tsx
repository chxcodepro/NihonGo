'use client'

import { useSettingsStore } from '@repo/shared/store/settingsStore'
import { Button } from '@repo/ui'
import type { Locale } from '@repo/shared'

const locales: Locale[] = ['zh-CN', 'en', 'ja']
const localeLabels: Record<Locale, string> = {
  'zh-CN': '中',
  en: 'EN',
  ja: '日',
}

export function LocaleSwitcher() {
  const { locale, setLocale } = useSettingsStore()

  const next = () => {
    const idx = locales.indexOf(locale)
    setLocale(locales[(idx + 1) % locales.length])
  }

  return (
    <Button variant="ghost" size="icon" onClick={next} className="w-9 text-sm font-medium" title={`当前: ${localeLabels[locale]}`}>
      {localeLabels[locale]}
      <span className="sr-only">切换语言</span>
    </Button>
  )
}
