import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100dvh-66px)] overflow-hidden">
        <Sidebar className="hidden lg:block" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </>
  )
}
