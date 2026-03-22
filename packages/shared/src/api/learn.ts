import { apiClient } from './client'
import type { KanaData, VocabItem, GrammarItem, ProgressItem } from '../types/learn'

export function getKana(type?: 'hiragana' | 'katakana'): Promise<KanaData> {
  return apiClient('/learn/kana', { params: type ? { type } : undefined })
}

export function getVocabulary(params: {
  level?: string
  page?: number
  limit?: number
  search?: string
}): Promise<{ items: VocabItem[]; total: number }> {
  return apiClient('/learn/vocabulary', { params })
}

export function getGrammar(params: {
  level?: string
  page?: number
  limit?: number
  search?: string
}): Promise<{ items: GrammarItem[]; total: number }> {
  return apiClient('/learn/grammar', { params })
}

export function getProgress(module: string): Promise<ProgressItem[]> {
  return apiClient(`/learn/progress/${module}`)
}

export function updateProgress(data: {
  module: string
  itemId: string
  quality: number
}): Promise<ProgressItem> {
  return apiClient('/learn/progress', { method: 'POST', body: data })
}

export function getReviewItems(module: string, limit?: number): Promise<ProgressItem[]> {
  return apiClient(`/learn/review/${module}`, { params: limit ? { limit } : undefined })
}
