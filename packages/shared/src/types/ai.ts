export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  corrections?: CorrectionBlock[]
}

export interface CorrectionBlock {
  type: 'correction' | 'grammar' | 'natural'
  original: string
  corrected: string
  explanation: string
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  scene: string
  createdAt: string
  updatedAt: string
}

export interface ScenePreset {
  id: string
  name: string
  nameZh: string
  icon: string
  systemPrompt: string
}
