'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@repo/ui'
import { useAuthStore } from '@repo/shared/store/authStore'
import { PageWrapper } from '@/components/layout/PageWrapper'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuthStore()
  const [error, setError] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError(errorParam)
      return
    }

    if (!code) {
      setError('缺少授权码')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/oauth/callback?code=${code}&state=${state || ''}`)
        if (!res.ok) throw new Error('验证失败')
        const data = await res.json()
        login(data)
        router.push('/')
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '验证失败，请重试')
      }
    }

    verify()
  }, [searchParams, login, router])

  if (error) {
    return (
      <PageWrapper>
        <div className="flex min-h-screen items-center justify-center px-4">
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">验证失败</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => router.push('/login')}>返回登录</Button>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">正在验证...</p>
        </div>
      </div>
    </PageWrapper>
  )
}
