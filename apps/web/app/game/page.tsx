'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Box } from 'lucide-react'
import { Card } from '@repo/ui'
import { PageWrapper } from '@/components/layout/PageWrapper'

const games = [
  {
    title: '打字竞速',
    description: '与AI比拼日语打字速度',
    icon: Zap,
    href: '/game/typing-race',
    gradient: 'from-[var(--color-sakura)] to-[var(--color-indigo)]',
  },
  {
    title: '推箱子记语法',
    description: '推箱子闯关学日语语法',
    icon: Box,
    href: '/game/sokoban',
    gradient: 'from-[var(--color-emerald)] to-[var(--color-indigo)]',
  },
]

export default function GamePage() {
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">游戏中心</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {games.map((game, index) => (
            <Link key={game.href} href={game.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="h-full"
              >
                <Card className={`relative overflow-hidden h-full p-8 bg-gradient-to-br ${game.gradient} text-white cursor-pointer transition-shadow hover:shadow-lg`}>
                  <div className="flex flex-col items-center text-center gap-4">
                    <game.icon className="w-16 h-16" />
                    <h2 className="text-2xl font-bold">{game.title}</h2>
                    <p className="text-white/80 text-lg">{game.description}</p>
                  </div>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
