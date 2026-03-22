'use client'

import { motion } from 'framer-motion'
import { User, UtensilsCrossed, Map, Briefcase, MessageCircle } from 'lucide-react'
import { Card } from '@repo/ui'

interface ScenePresetsProps {
  onSelect: (sceneId: string) => void
}

const scenes = [
  { id: 'intro', icon: User, name: '自我介绍', description: '练习日语自我介绍表达' },
  { id: 'restaurant', icon: UtensilsCrossed, name: '餐厅点餐', description: '学习餐厅场景常用对话' },
  { id: 'directions', icon: Map, name: '问路', description: '掌握问路与指路表达' },
  { id: 'interview', icon: Briefcase, name: '面试', description: '模拟日语面试场景' },
  { id: 'casual', icon: MessageCircle, name: '日常闲聊', description: '轻松的日常对话练习' },
]

export function ScenePresets({ onSelect }: ScenePresetsProps) {
  return (
    <div className="max-w-2xl w-full">
      <h2 className="text-2xl font-bold text-center mb-6">选择对话场景</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenes.map((scene, i) => (
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="p-6 cursor-pointer hover:shadow-md hover:border-[var(--color-sakura)] transition-all text-center space-y-3"
              onClick={() => onSelect(scene.id)}
            >
              <scene.icon className="w-10 h-10 mx-auto text-[var(--color-indigo)]" />
              <h3 className="font-semibold">{scene.name}</h3>
              <p className="text-sm text-muted-foreground">{scene.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
