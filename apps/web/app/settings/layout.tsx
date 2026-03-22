import { Navbar } from '@/components/layout/Navbar'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 px-4">{children}</main>
    </>
  )
}
