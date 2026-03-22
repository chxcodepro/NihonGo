import { Navbar } from '@/components/layout/Navbar'

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">{children}</main>
    </>
  )
}
