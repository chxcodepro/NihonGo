import { isBrowser } from './platform'

export const storage = {
  get<T>(key: string): T | null {
    if (!isBrowser()) return null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch { return null }
  },
  set(key: string, value: unknown): void {
    if (!isBrowser()) return
    try { localStorage.setItem(key, JSON.stringify(value)) }
    catch { /* quota exceeded */ }
  },
  remove(key: string): void {
    if (!isBrowser()) return
    localStorage.removeItem(key)
  },
}
