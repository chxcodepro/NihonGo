export interface KanaItem {
  id: string
  char: string
  romaji: string
  row: string
  column: number
  strokeSvg?: string
  audioText: string
}

export interface KanaData {
  hiragana: KanaItem[]
  katakana: KanaItem[]
}

export interface VocabItem {
  id: string
  word: string
  reading: string
  romaji: string
  meaningZh: string
  meaningEn: string
  partOfSpeech: string
  jlptLevel: string
  examples: VocabExample[]
  tags: string[]
}

export interface VocabExample {
  japanese: string
  reading: string
  meaning: string
}

export interface GrammarItem {
  id: string
  title: string
  meaning: string
  explanation: string
  structure: string
  jlptLevel: string
  examples: GrammarExample[]
  notes: string
}

export interface GrammarExample {
  japanese: string
  reading: string
  meaning: string
}

export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

export interface ProgressItem {
  itemId: string
  module: string
  level: number
  easeFactor: number
  intervalDays: number
  nextReview: string
  lastReview: string
}

export interface TypingMode {
  id: string
  name: string
  description: string
}

export interface TypingResult {
  wpm: number
  accuracy: number
  time: number
  errors: number
  total: number
}
