import { apiClient } from './client'
import type { LoginRequest, RegisterRequest, LoginResponse, OAuthProviderType } from '../types/auth'

export function login(data: LoginRequest): Promise<LoginResponse> {
  return apiClient('/auth/login', { method: 'POST', body: data })
}

export function register(data: RegisterRequest): Promise<LoginResponse> {
  return apiClient('/auth/register', { method: 'POST', body: data })
}

export function logout(): Promise<void> {
  return apiClient('/auth/logout', { method: 'POST' })
}

export function refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
  return apiClient('/auth/refresh', { method: 'POST', body: { refreshToken: token } })
}

export function oauthRedirect(provider: OAuthProviderType): string {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/api/auth/oauth/${provider}`
}

export function verifyEmail(code: string): Promise<void> {
  return apiClient('/auth/verify-email', { method: 'POST', body: { code } })
}
