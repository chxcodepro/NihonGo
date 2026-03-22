'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent, Button, Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from '@repo/ui'
import type { KanaItem } from '@repo/shared'
import { hiraganaData, katakanaData } from '@repo/question-bank'
import { KanaChart } from '@/components/learn/KanaChart'
import { KanaDetail } from '@/components/learn/KanaDetail'
import { KanaQuiz } from '@/components/learn/KanaQuiz'
import { useLearnStore } from '@repo/shared/store/learnStore'

export default function KanaPage() {
  const [selectedKana, setSelectedKana] = useState<KanaItem | null>(null)
  const [activeTab, setActiveTab] = useState<'hiragana' | 'katakana' | 'all'>('hiragana')
  const [quizOpen, setQuizOpen] = useState(false)
  const { markKanaMastered } = useLearnStore()

  const currentData = activeTab === 'hiragana'
    ? hiraganaData
    : activeTab === 'katakana'
      ? katakanaData
      : [...hiraganaData, ...katakanaData]

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">五十音图</h1>
          <p className="mt-1 text-sm text-muted-foreground">掌握日语发音的基础</p>
        </div>
        <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
          <DialogTrigger asChild>
            <Button>开始测验</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>假名测验</DialogTitle>
            </DialogHeader>
            <KanaQuiz kanaData={currentData as unknown as KanaItem[]} onClose={() => setQuizOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'hiragana' | 'katakana' | 'all')}>
        <TabsList>
          <TabsTrigger value="hiragana">平假名</TabsTrigger>
          <TabsTrigger value="katakana">片假名</TabsTrigger>
          <TabsTrigger value="all">全部</TabsTrigger>
        </TabsList>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <TabsContent value="hiragana" className="mt-0">
              <KanaChart type="hiragana" onSelect={setSelectedKana} selectedId={selectedKana?.id} />
            </TabsContent>
            <TabsContent value="katakana" className="mt-0">
              <KanaChart type="katakana" onSelect={setSelectedKana} selectedId={selectedKana?.id} />
            </TabsContent>
            <TabsContent value="all" className="mt-0 space-y-6">
              <KanaChart type="hiragana" onSelect={setSelectedKana} selectedId={selectedKana?.id} />
              <KanaChart type="katakana" onSelect={setSelectedKana} selectedId={selectedKana?.id} />
            </TabsContent>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-20">
              <KanaDetail kana={selectedKana} onMastered={markKanaMastered} />
            </div>
          </div>
        </div>
      </Tabs>

      <div className="mt-4 lg:hidden">
        <KanaDetail kana={selectedKana} onMastered={markKanaMastered} />
      </div>
    </div>
  )
}
