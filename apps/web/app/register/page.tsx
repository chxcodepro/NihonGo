'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@repo/ui'
import { useAuthStore } from '@repo/shared/store/authStore'
import { register as registerApi } from '@repo/shared/api/auth'
import { Navbar } from '@/components/layout/Navbar'
import { PageWrapper } from '@/components/layout/PageWrapper'

function getPasswordStrength(pw: string): { level: 'weak' | 'medium' | 'strong'; color: string; width: string } {
  if (pw.length < 8) return { level: 'weak', color: 'bg-red-500', width: 'w-1/3' }
  const hasUpper = /[A-Z]/.test(pw)
  const hasLower = /[a-z]/.test(pw)
  const hasNumber = /\d/.test(pw)
  const hasSymbol = /[^A-Za-z0-9]/.test(pw)
  if (hasUpper && hasLower && hasNumber && hasSymbol) {
    return { level: 'strong', color: 'bg-green-500', width: 'w-full' }
  }
  if (hasUpper && hasLower) {
    return { level: 'medium', color: 'bg-yellow-500', width: 'w-2/3' }
  }
  return { level: 'weak', color: 'bg-red-500', width: 'w-1/3' }
}

const strengthLabels = { weak: '弱', medium: '中', strong: '强' }

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const strength = password ? getPasswordStrength(password) : null

  const sendCode = useCallback(() => {
    if (!email || countdown > 0) return
    setCountdown(60)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [email, countdown])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('两次密码不一致')
      return
    }
    if (password.length < 8) {
      setError('密码至少8位')
      return
    }
    setLoading(true)
    try {
      const data = await registerApi({ username, email, password, confirmPassword, verifyCode })
      login(data)
      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
          <Card className="w-full max-w-[460px]">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">注册 NihonGo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">用户名</label>
                  <Input
                    id="username"
                    placeholder="输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="reg-email" className="text-sm font-medium">邮箱</label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="verify-code" className="text-sm font-medium">验证码</label>
                  <div className="flex gap-2">
                    <Input
                      id="verify-code"
                      placeholder="输入验证码"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      disabled={!email || countdown > 0}
                      onClick={sendCode}
                    >
                      {countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="reg-password" className="text-sm font-medium">密码</label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="至少8位密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {strength && (
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        密码强度：{strengthLabels[strength.level]}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium">确认密码</label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '注册中...' : '注册'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">
                已有账号？
                <Link href="/login" className="text-primary hover:underline ml-1">
                  立即登录
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </PageWrapper>
    </>
  )
}
