'use client'

import type { ChatMessage as ChatMessageType } from '@repo/shared'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="text-center">
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  // 解析AI消息中的特殊块
  const renderContent = (content: string) => {
    if (isUser) return <p className="whitespace-pre-wrap">{content}</p>

    // 匹配 [correction], [grammar], [natural] 块
    const blocks = content.split(/(\[correction\][\s\S]*?\[\/correction\]|\[grammar\][\s\S]*?\[\/grammar\]|\[natural\][\s\S]*?\[\/natural\])/)

    return blocks.map((block, i) => {
      if (block.startsWith('[correction]')) {
        const text = block.replace(/\[\/?correction\]/g, '').trim()
        return (
          <div key={i} className="border-l-4 border-[var(--color-coral)] bg-[var(--color-coral)]/5 p-3 rounded-r-lg my-2">
            <p className="text-sm">{text}</p>
          </div>
        )
      }
      if (block.startsWith('[grammar]')) {
        const text = block.replace(/\[\/?grammar\]/g, '').trim()
        return (
          <div key={i} className="border-l-4 border-[var(--color-indigo)] bg-[var(--color-indigo)]/5 p-3 rounded-r-lg my-2">
            <p className="text-sm">{text}</p>
          </div>
        )
      }
      if (block.startsWith('[natural]')) {
        const text = block.replace(/\[\/?natural\]/g, '').trim()
        return (
          <div key={i} className="border-l-4 border-[var(--color-emerald)] bg-[var(--color-emerald)]/5 p-3 rounded-r-lg my-2">
            <p className="text-sm">{text}</p>
          </div>
        )
      }
      return block.trim() ? <p key={i} className="whitespace-pre-wrap">{block}</p> : null
    })
  }

  const time = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-[var(--color-sakura)] text-white rounded-br-sm'
            : 'bg-muted rounded-bl-sm'
        }`}
      >
        <div className="text-sm space-y-1">{renderContent(message.content)}</div>
        <p className={`text-xs mt-1 ${isUser ? 'text-white/60' : 'text-muted-foreground'}`}>
          {time}
        </p>
      </div>
    </div>
  )
}
