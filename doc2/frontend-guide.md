# 前端开发指南

## 一、技术栈总览

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI框架 |
| Next.js | 15 | Web框架 (App Router, RSC) |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 4 | 原子化样式 |
| shadcn/ui | latest | 组件库基础 |
| Framer Motion | 11 | 动画效果 |
| Zustand | 5 | 状态管理 |
| React Query | 5 | 服务端状态 |
| next-intl | 3 | Web端i18n |
| Expo | SDK 52 | 移动端框架 |
| NativeWind | 4 | 移动端Tailwind |
| Tauri | 2 | 桌面端 |

## 二、Monorepo 结构规范

### 2.1 Workspace 配置

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 2.2 包依赖关系

```
apps/web        → packages/ui, packages/shared, packages/i18n, packages/question-bank
apps/mobile     → packages/ui (部分), packages/shared, packages/i18n, packages/question-bank
apps/desktop    → 复用 apps/web 构建产物

packages/ui     → 独立，仅依赖 React + Tailwind
packages/shared → 独立，类型/工具/Hooks/Store/API
packages/i18n   → 独立，多语言资源
packages/question-bank → 独立，静态JSON数据
```

### 2.3 共享包开发规范

```typescript
// packages/shared/types/user.ts
export interface User {
    id: number
    username: string
    email: string | null
    avatarUrl: string
    locale: Locale
    theme: Theme
}

export type Locale = 'zh-CN' | 'en' | 'ja'
export type Theme = 'light' | 'dark' | 'system'
```

```typescript
// packages/shared/api/client.ts
// 统一API Client，三端共用
import { ofetch } from 'ofetch'

export const apiClient = ofetch.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    onRequest({ options }) {
        const token = useAuthStore.getState().accessToken
        if (token) {
            options.headers.set('Authorization', `Bearer ${token}`)
        }
    },
    onResponseError({ response }) {
        if (response.status === 401) {
            // 触发Token刷新
        }
    }
})
```

## 三、Web端 (Next.js) 开发规范

### 3.1 目录结构

```
apps/web/
├── app/                        # App Router
│   ├── layout.tsx              # 根布局 (主题Provider, i18n)
│   ├── page.tsx                # 首页
│   ├── globals.css             # 全局样式
│   │
│   ├── (public)/               # 公开路由组
│   │   ├── learn/
│   │   │   ├── kana/
│   │   │   │   └── page.tsx    # 五十音图页面
│   │   │   ├── vocabulary/
│   │   │   │   └── page.tsx
│   │   │   ├── grammar/
│   │   │   │   └── page.tsx
│   │   │   └── typing/
│   │   │       └── page.tsx
│   │   ├── game/
│   │   │   ├── typing-race/
│   │   │   │   └── page.tsx
│   │   │   └── sokoban/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── (auth)/                 # 认证路由组
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── page.tsx        # OAuth回调
│   │
│   └── (protected)/            # 需登录路由组
│       ├── layout.tsx          # 登录检查中间件
│       ├── ai-chat/
│       │   └── page.tsx
│       └── profile/
│           └── page.tsx
│
├── components/                 # Web专用组件
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   ├── learn/
│   │   ├── KanaChart.tsx       # 五十音交互表格
│   │   ├── VocabCard.tsx       # 词汇卡片
│   │   ├── GrammarLesson.tsx   # 语法课程
│   │   └── TypingPractice.tsx  # 打字练习
│   ├── game/
│   │   ├── TypingRace.tsx      # 打字竞速
│   │   └── SokobanBoard.tsx    # 推箱子
│   ├── ai/
│   │   ├── ChatWindow.tsx      # AI对话窗口
│   │   └── ChatMessage.tsx     # 对话消息
│   └── common/
│       ├── ThemeToggle.tsx
│       ├── LocaleSwitcher.tsx
│       └── TTSButton.tsx       # TTS发音按钮
│
├── hooks/                      # Web专用Hooks
│   ├── useTTS.ts              # Web Speech API封装
│   └── useMediaQuery.ts
│
├── lib/                        # Web端工具
│   └── fonts.ts               # 字体配置
│
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### 3.2 页面组件规范

```tsx
// app/(public)/learn/kana/page.tsx
import { KanaChart } from '@/components/learn/KanaChart'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
    const t = await getTranslations('learn.kana')
    return { title: t('title') }
}

export default function KanaPage() {
    return (
        <main className="container mx-auto px-4 py-8">
            <KanaChart />
        </main>
    )
}
```

### 3.3 组件开发规范

```tsx
// components/common/TTSButton.tsx
'use client'

import { Volume2 } from 'lucide-react'
import { Button } from '@repo/ui/button'
import { useTTS } from '@/hooks/useTTS'

interface TTSButtonProps {
    text: string
    lang?: string
    rate?: number
    className?: string
}

export function TTSButton({ text, lang = 'ja-JP', rate = 0.9, className }: TTSButtonProps) {
    const { speak, isSpeaking } = useTTS()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => speak(text, { lang, rate })}
            disabled={isSpeaking}
            className={className}
            aria-label={`播放 ${text}`}
        >
            <Volume2 className={isSpeaking ? 'animate-pulse text-primary' : ''} />
        </Button>
    )
}
```

### 3.4 TTS Hook 实现

```tsx
// hooks/useTTS.ts
'use client'

import { useState, useCallback, useRef } from 'react'

interface SpeakOptions {
    lang?: string
    rate?: number
    pitch?: number
    volume?: number
}

export function useTTS() {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

    const speak = useCallback((text: string, options: SpeakOptions = {}) => {
        const { lang = 'ja-JP', rate = 0.9, pitch = 1, volume = 1 } = options

        // 停止当前朗读
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang
        utterance.rate = rate
        utterance.pitch = pitch
        utterance.volume = volume

        // 优先选择日语语音
        const voices = window.speechSynthesis.getVoices()
        const jaVoice = voices.find(v => v.lang.startsWith('ja'))
        if (jaVoice) utterance.voice = jaVoice

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        utteranceRef.current = utterance
        window.speechSynthesis.speak(utterance)
    }, [])

    const stop = useCallback(() => {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
    }, [])

    return { speak, stop, isSpeaking }
}
```

## 四、状态管理规范 (Zustand)

### 4.1 Store 设计

```typescript
// packages/shared/store/auth.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isLoggedIn: boolean

    login: (data: LoginResponse) => void
    logout: () => void
    updateUser: (user: Partial<User>) => void
    setTokens: (access: string, refresh: string) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoggedIn: false,

            login: (data) => set({
                user: data.user,
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                isLoggedIn: true,
            }),

            logout: () => set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isLoggedIn: false,
            }),

            updateUser: (partial) => set((state) => ({
                user: state.user ? { ...state.user, ...partial } : null,
            })),

            setTokens: (access, refresh) => set({
                accessToken: access,
                refreshToken: refresh,
            }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                refreshToken: state.refreshToken,
                user: state.user,
            }),
        }
    )
)
```

### 4.2 学习进度 Store

```typescript
// packages/shared/store/learn.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LearnState {
    // 本地进度 (未登录用户)
    localProgress: Record<string, ProgressItem>

    updateProgress: (module: string, itemId: string, correct: boolean) => void
    getNextReview: (module: string) => ProgressItem[]
    syncToCloud: () => Promise<void>
}
```

## 五、API 请求规范 (React Query)

```typescript
// packages/shared/api/learn.ts
import { apiClient } from './client'

export const learnApi = {
    getKana: (type: 'hiragana' | 'katakana' | 'all') =>
        apiClient<KanaResponse>(`/learn/kana`, { query: { type } }),

    getVocabulary: (params: { level: string; page: number; pageSize: number }) =>
        apiClient<VocabResponse>(`/learn/vocabulary`, { query: params }),

    updateProgress: (data: ProgressUpdate) =>
        apiClient<void>(`/learn/progress`, { method: 'POST', body: data }),
}

// 在组件中使用
// components/learn/VocabList.tsx
import { useQuery } from '@tanstack/react-query'
import { learnApi } from '@repo/shared/api/learn'

export function VocabList({ level }: { level: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ['vocabulary', level],
        queryFn: () => learnApi.getVocabulary({ level, page: 1, pageSize: 20 }),
    })

    if (isLoading) return <Skeleton />
    return <div>{/* 渲染词汇列表 */}</div>
}
```

## 六、主题系统

### 6.1 Tailwind 配置

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
    darkMode: 'class',
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        '../../packages/ui/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // shadcn/ui CSS变量主题
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                // 日语学习专用色
                kana: {
                    hiragana: 'hsl(var(--kana-hiragana))',     // 平假名强调色
                    katakana: 'hsl(var(--kana-katakana))',     // 片假名强调色
                },
            },
            fontFamily: {
                sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
                ja: ['Noto Sans JP', 'sans-serif'],           // 日文专用
                mono: ['JetBrains Mono', 'monospace'],        // 打字练习
            },
        },
    },
} satisfies Config
```

### 6.2 主题切换

```tsx
// components/common/ThemeToggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@repo/ui/button'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const icons = { light: Sun, dark: Moon, system: Monitor }
    const next = { light: 'dark', dark: 'system', system: 'light' }

    const Icon = icons[theme as keyof typeof icons] || Monitor

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(next[theme as keyof typeof next] || 'light')}
        >
            <Icon className="h-5 w-5" />
        </Button>
    )
}
```

## 七、动画规范 (Framer Motion)

```tsx
// 页面切换动画
import { motion } from 'framer-motion'

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20 },
}

export function PageWrapper({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {children}
        </motion.div>
    )
}

// 卡片翻转动画 (词汇学习)
const flipVariants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
}

// 列表项动画
const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.05 },
    }),
}
```

## 八、移动端注意事项 (Expo)

### 8.1 平台差异处理

```typescript
// packages/shared/utils/platform.ts
import { Platform } from 'react-native'

export const isWeb = Platform.OS === 'web'
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android'
export const isDesktop = typeof window !== 'undefined' && window.__TAURI__

// TTS 平台适配
export async function speakText(text: string, lang = 'ja-JP') {
    if (isWeb) {
        // Web Speech API
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang
        speechSynthesis.speak(utterance)
    } else if (isMobile) {
        // Expo Speech
        const Speech = await import('expo-speech')
        Speech.speak(text, { language: lang, rate: 0.9 })
    }
}
```

### 8.2 存储适配

```typescript
// packages/shared/utils/storage.ts
export const storage = {
    async get(key: string): Promise<string | null> {
        if (isWeb) return localStorage.getItem(key)
        if (isMobile) {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
            return AsyncStorage.getItem(key)
        }
        return null
    },
    async set(key: string, value: string): Promise<void> {
        if (isWeb) localStorage.setItem(key, value)
        if (isMobile) {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
            await AsyncStorage.setItem(key, value)
        }
    },
}
```

## 九、性能优化清单

1. **代码分割**: 使用 `next/dynamic` 延迟加载游戏/AI模块
2. **图片优化**: `next/image` + WebP格式
3. **字体优化**: `next/font` 子集化加载Noto Sans JP
4. **预加载**: 五十音/词汇数据预取
5. **虚拟列表**: 长列表使用 `@tanstack/react-virtual`
6. **Service Worker**: PWA离线缓存题库数据
7. **Bundle分析**: `@next/bundle-analyzer` 定期检查包大小
