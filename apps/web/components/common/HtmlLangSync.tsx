'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@repo/shared/store/settingsStore'

export function HtmlLangSync() {
  const locale = useSettingsStore((s) => s.locale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return null
}
