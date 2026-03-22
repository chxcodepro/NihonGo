import { ofetch } from 'ofetch'

const API_BASE = typeof window !== 'undefined'
  ? (window as any).__NEXT_DATA__?.runtimeConfig?.apiUrl || '/api'
  : process.env.NEXT_PUBLIC_API_URL || '/api'

let _authToken: string | null = null

export const apiClient = ofetch.create({
  baseURL: API_BASE,
  onRequest({ options }) {
    const token = _authToken || (typeof window !== 'undefined' ? (window as any).__AUTH_TOKEN : null)
    if (token) {
      ;(options as any).headers = { ...options.headers, Authorization: `Bearer ${token}` }
    }
  },
  onResponseError({ response }) {
    if (response.status === 401) {
      // Token refresh handled by auth interceptor
    }
  },
})

export function setAuthToken(token: string | null) {
  _authToken = token
  if (typeof window !== 'undefined') {
    (window as any).__AUTH_TOKEN = token
  }
}
