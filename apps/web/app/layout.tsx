import type { Metadata } from 'next'
import { Urbanist, Noto_Sans_JP, Noto_Sans_SC, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { QueryProvider } from '@/components/common/QueryProvider'
import { HtmlLangSync } from '@/components/common/HtmlLangSync'
import './globals.css'

const urbanist = Urbanist({ subsets: ['latin'], variable: '--font-urbanist', weight: ['300', '400', '500', '600', '700', '800'] })
const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto-jp', weight: ['400', '500', '700'] })
const notoSansSC = Noto_Sans_SC({ subsets: ['latin'], variable: '--font-noto-sc', weight: ['400', '500', '700'] })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: { default: 'NihonGo - 日语学习', template: '%s | NihonGo' },
  description: '一站式日语学习平台 - 五十音、词汇、语法、打字练习、AI对话',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${urbanist.variable} ${notoSansJP.variable} ${notoSansSC.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <HtmlLangSync />
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
