import { apiClient } from './client'
import type { Conversation, ChatMessage } from '../types/ai'

export function sendMessage(
  conversationId: string,
  message: string
): Promise<ChatMessage> {
  return apiClient(`/ai/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { content: message },
  })
}

export function getConversations(): Promise<Conversation[]> {
  return apiClient('/ai/conversations')
}

export function getConversation(id: string): Promise<Conversation> {
  return apiClient(`/ai/conversations/${id}`)
}

export function deleteConversation(id: string): Promise<void> {
  return apiClient(`/ai/conversations/${id}`, { method: 'DELETE' })
}

export function createConversation(scene: string): Promise<Conversation> {
  return apiClient('/ai/conversations', { method: 'POST', body: { scene } })
}
