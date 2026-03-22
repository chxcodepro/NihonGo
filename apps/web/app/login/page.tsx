'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Github, Chrome } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@repo/ui'
import { useAuthStore } from '@repo/shared/store/authStore'
import { login as loginApi, oauthRedirect } from '@repo/shared/api/auth'
import { Navbar } from '@/components/layout/Navbar'
import { PageWrapper } from '@/components/layout/PageWrapper'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginApi({ email, password })
      login(data)
      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = (provider: 'google' | 'github' | 'linuxdo') => {
    window.location.href = oauthRedirect(provider)
  }

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
          <Card className="w-full max-w-[420px]">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">登录 NihonGo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">邮箱</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium">密码</label>
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                      忘记密码？
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="输入密码"
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
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '登录中...' : '登录'}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">或</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuth('google')}
                >
                  <Chrome className="mr-2 h-4 w-4 text-red-500" />
                  Google 登录
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuth('github')}
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub 登录
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuth('linuxdo')}
                >
                  <span className="mr-2 h-4 w-4 inline-flex items-center justify-center rounded-sm bg-green-500 text-white text-xs font-bold">L</span>
                  LinuxDo 登录
                </Button>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">
                没有账号？
                <Link href="/register" className="text-primary hover:underline ml-1">
                  立即注册
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </PageWrapper>
    </>
  )
}
