export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
  verifyCode: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: import('./user').User
}

export interface OAuthProvider {
  id: string
  name: string
  icon: string
}

export type OAuthProviderType = 'google' | 'github' | 'linuxdo'
