'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, MessageCircle } from 'lucide-react'
import { Button, Card } from '@repo/ui'
import type { ChatMessage, Conversation } from '@repo/shared'
import { ChatWindow } from '@/components/ai/ChatWindow'
import { ScenePresets } from '@/components/ai/ScenePresets'

const mockConversations: Conversation[] = [
  {
    id: '1',
    title: '自我介绍练习',
    scene: 'self_intro',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      { id: '1', role: 'system', content: '你正在进行自我介绍场景的对话练习。', timestamp: Date.now() },
      { id: '2', role: 'assistant', content: 'こんにちは！自己紹介の練習をしましょう。まず、お名前を教えてください。', timestamp: Date.now() },
    ],
  },
]

export default function AIChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [activeId, setActiveId] = useState<string | null>(mockConversations[0]?.id ?? null)

  const activeConversation = conversations.find((c) => c.id === activeId)

  const handleNewConversation = useCallback(() => {
    setActiveId(null)
  }, [])

  const handleSceneSelect = useCallback((sceneId: string) => {
    const sceneNames: Record<string, string> = {
      intro: '自我介绍',
      restaurant: '餐厅点餐',
      directions: '问路',
      interview: '面试',
      casual: '日常闲聊',
    }
    const newConv: Conversation = {
      id: String(Date.now()),
      title: sceneNames[sceneId] ?? '新对话',
      scene: sceneId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: `让我们开始${sceneNames[sceneId] ?? ''}的对话练习吧！请用日语开始。`,
          timestamp: Date.now(),
        },
      ],
    }
    setConversations((prev) => [newConv, ...prev])
    setActiveId(newConv.id)
  }, [])

  const handleSend = useCallback((text: string) => {
    if (!activeId) return

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, userMsg], lastMessage: text, updatedAt: new Date().toISOString() }
          : c
      )
    )

    // 模拟AI回复（打字机效果在ChatWindow中处理）
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: 'いいですね！とても上手です。もう少し詳しく教えてください。',
        timestamp: Date.now(),
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, aiMsg], lastMessage: aiMsg.content, updatedAt: new Date().toISOString() }
            : c
        )
      )
    }, 1000)
  }, [activeId])

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* 左侧: 对话列表 */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Button className="w-full" onClick={handleNewConversation}>
            <Plus className="w-4 h-4 mr-2" />
            新对话
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                activeId === conv.id ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm truncate">{conv.title}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{conv.messages[conv.messages.length - 1]?.content ?? ''}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 右侧: 聊天区域 */}
      <div className="flex-1">
        {activeConversation ? (
          <ChatWindow
            messages={activeConversation.messages}
            onSend={handleSend}
          />
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <ScenePresets onSelect={handleSceneSelect} />
          </div>
        )}
      </div>
    </div>
  )
}
