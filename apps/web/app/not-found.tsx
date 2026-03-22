import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-bold">页面不存在</h2>
      <p className="text-muted-foreground">您访问的页面可能已被移动或删除</p>
      <Link href="/" className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
        返回首页
      </Link>
    </div>
  )
}
