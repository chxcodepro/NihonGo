export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function isMobile(): boolean {
  if (!isBrowser()) return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function isDesktop(): boolean {
  if (!isBrowser()) return false
  return '__TAURI__' in window
}

export function getPlatform(): 'web' | 'mobile' | 'desktop' {
  if (isDesktop()) return 'desktop'
  if (isMobile()) return 'mobile'
  return 'web'
}
