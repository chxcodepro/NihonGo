'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Type,
  BookOpen,
  Gauge,
  Globe,
  Palette,
  Target,
  Key,
  Server,
  Cpu,
  Trash2,
} from 'lucide-react'
import {
  Avatar,
  Button,
  Card,
  Input,
  Select,
  Dialog,
} from '@repo/ui'
import { useAuthStore } from '@repo/shared/store/authStore'

const statsCards = [
  { label: '学习天数', value: '30 天', icon: Calendar, color: 'text-[var(--color-sakura)]' },
  { label: '掌握假名', value: '0 / 92', icon: Type, color: 'text-[var(--color-indigo)]' },
  { label: '词汇量', value: '0', icon: BookOpen, color: 'text-[var(--color-emerald)]' },
  { label: '打字速度', value: '0 WPM', icon: Gauge, color: 'text-amber-500' },
]

export default function ProfilePage() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [theme, setTheme] = useState('system')
  const [language, setLanguage] = useState('zh-CN')
  const [dailyGoal, setDailyGoal] = useState(30)
  const [apiBaseUrl, setApiBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gpt-4')

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
      {/* 用户信息 */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <Avatar className="w-24 h-24 text-3xl bg-[var(--color-sakura)] text-white flex items-center justify-center rounded-full">
            学
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">学习者</h1>
            <p className="text-muted-foreground">learner@nihongo.app</p>
          </div>
        </div>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4 text-center">
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 偏好设置 */}
      <Card className="p-6 space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5" />
          偏好设置
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">主题</label>
            <Select value={theme} onValueChange={setTheme}>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="system">跟随系统</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">语言</label>
            <Select value={language} onValueChange={setLanguage}>
              <option value="zh-CN">简体中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              每日学习目标: {dailyGoal} 分钟
            </label>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full accent-[var(--color-sakura)]"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5分钟</span>
              <span>120分钟</span>
            </div>
          </div>
        </div>
      </Card>

      {/* AI 配置 */}
      <Card className="p-6 space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Cpu className="w-5 h-5" />
          AI 配置
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Server className="w-4 h-4" />
              Base URL
            </label>
            <Input
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Key
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">模型</label>
            <Select value={model} onValueChange={setModel}>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="custom">自定义</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* 危险区域 */}
      <Card className="p-6 border-[var(--color-coral)]">
        <h2 className="text-lg font-semibold text-[var(--color-coral)] mb-4">危险操作</h2>
        <p className="text-sm text-muted-foreground mb-4">
          删除账号后，所有学习数据将永久丢失，无法恢复。
        </p>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          删除账号
        </Button>
      </Card>

      {/* 删除确认对话框 */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-semibold">确认删除账号</h3>
            <p className="text-sm text-muted-foreground">
              此操作不可撤销。所有学习记录、统计数据将被永久删除。
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                取消
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
                确认删除
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
