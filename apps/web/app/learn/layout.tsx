import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen pt-16">
        <Sidebar className="hidden lg:block" currentPath="" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </>
  )
}
