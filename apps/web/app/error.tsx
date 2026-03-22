'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">出错了</h2>
      <p className="text-muted-foreground">很抱歉，发生了意外错误</p>
      <button onClick={reset} className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
        重试
      </button>
    </div>
  )
}
