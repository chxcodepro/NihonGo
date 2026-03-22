'use client'

import { useCallback } from 'react'
import { useSettingsStore } from '@repo/shared/store/settingsStore'
import { messages, defaultLocale } from '@repo/i18n'
import type { Locale, MessageValue } from '@repo/i18n'

function resolve(obj: MessageValue | undefined, path: string): string {
  if (obj === undefined) return path
  if (typeof obj === 'string') return obj
  const [head, ...rest] = path.split('.')
  if (rest.length === 0) {
    const val = obj[head]
    return typeof val === 'string' ? val : path
  }
  return resolve(obj[head], rest.join('.'))
}

export function useTranslation(namespace: string) {
  const locale = useSettingsStore((s) => s.locale) as Locale
  const ns = messages[locale]?.[namespace] ?? messages[defaultLocale][namespace]

  const t = useCallback(
    (key: string): string => resolve(ns, key),
    [ns],
  )

  return { t, locale }
}
