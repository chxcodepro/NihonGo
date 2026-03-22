'use client'

import { motion } from 'framer-motion'
import {
  Palette,
  Globe,
  BookOpen,
  Info,
  Sun,
  Moon,
  Monitor,
  ExternalLink,
} from 'lucide-react'
import { Button, Card, Input, Select } from '@repo/ui'
import { useSettingsStore } from '@repo/shared/store/settingsStore'

export default function SettingsPage() {
  const {
    theme,
    locale,
    dailyGoal,
    setTheme,
    setLocale,
    updateSettings,
  } = useSettingsStore()

  const themeOptions = [
    { value: 'light', label: '浅色', icon: Sun },
    { value: 'dark', label: '深色', icon: Moon },
    { value: 'system', label: '跟随系统', icon: Monitor },
  ]

  return (
    <div className="container mx-auto py-12 max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">设置</h1>

      {/* 外观 */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            外观
          </h2>
          <div className="flex gap-3">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value as 'light' | 'dark' | 'system')}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  theme === opt.value
                    ? 'border-[var(--color-sakura)] bg-[var(--color-sakura)]/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <opt.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* 语言 */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5" />
            语言
          </h2>
          <Select value={locale} onValueChange={(v) => setLocale(v as 'zh-CN' | 'en' | 'ja')}>
            <option value="zh-CN">简体中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </Select>
        </Card>
      </motion.div>

      {/* 学习偏好 */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            学习偏好
          </h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">每日学习目标: {dailyGoal} 分钟</label>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={dailyGoal}
              onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })}
              className="w-full accent-[var(--color-sakura)]"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5分钟</span>
              <span>120分钟</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">SRS 间隔参数</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">简单倍率</label>
                <Input type="number" defaultValue="2.5" step="0.1" min="1" max="5" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">良好倍率</label>
                <Input type="number" defaultValue="1.5" step="0.1" min="1" max="5" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">困难倍率</label>
                <Input type="number" defaultValue="0.8" step="0.1" min="0.1" max="2" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 关于 */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Info className="w-5 h-5" />
            关于
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">版本</span>
              <span className="font-mono">0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">许可证</span>
              <span>MIT License</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              检查更新
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://github.com', '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              GitHub
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
