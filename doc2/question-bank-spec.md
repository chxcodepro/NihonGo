# 题库格式规范

## 一、概述

题库是应用的核心数据，分为两层：
1. **静态题库** (JSON文件): 随应用发布，作为兜底
2. **AI动态题目**: 学完知识点后AI实时生成，作为补充

静态题库位于 `packages/question-bank/`。

为了方便后续新增题型、题包、游戏内容和维护流程，推荐把题库设计成**注册式 + 清单式**结构，而不是长期依赖“固定目录 + 固定文件名”硬编码。

更详细的注册规范，可继续参考 `content-registry-spec.md`。

## 二、目录结构

```
packages/question-bank/
├── index.ts                    # 导出入口
├── kana/
│   ├── hiragana.json          # 平假名 (46字 + 浊音/半浊音/拗音)
│   └── katakana.json          # 片假名
├── vocabulary/
│   ├── n5.json                # JLPT N5 词汇 (~800词)
│   ├── n4.json                # JLPT N4 词汇 (~1500词)
│   ├── n3.json                # JLPT N3 词汇 (~3000词)
│   ├── n2.json                # JLPT N2 词汇 (~6000词)
│   └── n1.json                # JLPT N1 词汇 (~10000词)
├── grammar/
│   ├── n5.json                # N5 语法 (~80条)
│   ├── n4.json                # N4 语法 (~120条)
│   ├── n3.json                # N3 语法 (~180条)
│   ├── n2.json                # N2 语法 (~200条)
│   └── n1.json                # N1 语法 (~220条)
├── typing/
│   ├── beginner.json          # 初级打字素材
│   ├── intermediate.json      # 中级打字素材
│   └── advanced.json          # 高级打字素材
├── games/
│   └── sokoban-levels.json    # 推箱子关卡数据
└── quizzes/
    ├── n5-quiz.json           # N5基础题
    ├── n4-quiz.json
    ├── n3-quiz.json
    ├── n2-quiz.json
    └── n1-quiz.json
```

### 2.1 推荐扩展结构

为了更方便维护，推荐后续逐步演进为下面这种结构：

```text
packages/question-bank/
├── index.ts
├── manifest.json                # 总清单
├── schemas/                     # schema 定义（可选）
├── modules/
│   ├── kana/
│   │   ├── manifest.json
│   │   └── packs/
│   ├── vocabulary/
│   │   ├── manifest.json
│   │   └── packs/
│   ├── grammar/
│   │   ├── manifest.json
│   │   └── packs/
│   ├── typing/
│   │   ├── manifest.json
│   │   └── packs/
│   └── quizzes/
│       ├── manifest.json
│       └── packs/
└── games/
    ├── manifest.json
    ├── sokoban/
    │   ├── manifest.json
    │   └── levels/
    └── typing-race/
        ├── manifest.json
        └── packs/
```

### 2.2 这样拆的好处

这样做的主要好处：

1. 新增内容时，不用总去改一个超大的总文件
2. 新增 pack 比新增大而全的单文件更容易 review 和维护
3. 模块内容和游戏内容可以统一挂在 manifest 下管理
4. 后续更容易做校验、导出、版本兼容和增量更新

### 2.3 manifest 和 pack 的职责

推荐职责拆分如下：

- `manifest.json`：负责注册、索引、版本信息、发布状态
- `pack/*.json`：负责承载实际学习内容
- `games/**/levels/*.json`：负责承载关卡或游戏内容包

这样后面维护动作就能拆小：

- 改内容，主要改 pack
- 改注册，主要改 manifest
- 改结构，主要改 schema 和类型
- 改玩法，主要改 `game-design.md`

## 三、数据格式定义

### 3.0 通用元信息建议

为了支持可扩展结构，建议后续所有 pack 顶层统一带这些字段：

```json
{
    "id": "vocabulary_jlpt_n5_core",
    "module": "vocabulary",
    "type": "pack",
    "version": "1.0.0",
    "schema_version": "1.0.0",
    "title": "JLPT N5 核心词汇",
    "tags": ["jlpt", "n5", "core"],
    "jlpt": ["N5"],
    "difficulty": "beginner",
    "source": "internal",
    "maintainer": "content-team",
    "status": "published",
    "data": []
}
```

推荐统一字段：

- `id`
- `module`
- `type`
- `version`
- `schema_version`
- `title`
- `tags`
- `jlpt`
- `difficulty`
- `source`
- `maintainer`
- `status`

### 3.1 假名 (kana)

```json
// kana/hiragana.json
{
    "type": "hiragana",
    "version": "1.0.0",
    "data": [
        {
            "id": "hiragana_a",
            "char": "あ",
            "romaji": "a",
            "row": "vowel",
            "column": 1,
            "category": "gojuon",
            "stroke_count": 3,
            "mnemonic_zh": "像一个人在跳舞",
            "mnemonic_en": "Looks like a person dancing",
            "similar": ["お"],
            "audio_text": "あ"
        },
        {
            "id": "hiragana_ka",
            "char": "か",
            "romaji": "ka",
            "row": "k",
            "column": 1,
            "category": "gojuon",
            "stroke_count": 3,
            "mnemonic_zh": "像一把刀在切东西(ka=cut)",
            "mnemonic_en": "Looks like a knife cutting",
            "similar": ["が", "き"],
            "audio_text": "か"
        }
    ],
    "rows": [
        {"id": "vowel", "label": "あ行", "consonant": ""},
        {"id": "k", "label": "か行", "consonant": "k"},
        {"id": "s", "label": "さ行", "consonant": "s"},
        {"id": "t", "label": "た行", "consonant": "t"},
        {"id": "n", "label": "な行", "consonant": "n"},
        {"id": "h", "label": "は行", "consonant": "h"},
        {"id": "m", "label": "ま行", "consonant": "m"},
        {"id": "y", "label": "や行", "consonant": "y"},
        {"id": "r", "label": "ら行", "consonant": "r"},
        {"id": "w", "label": "わ行", "consonant": "w"},
        {"id": "nn", "label": "ん", "consonant": "n"}
    ],
    "categories": {
        "gojuon": "清音 (五十音)",
        "dakuon": "浊音",
        "handakuon": "半浊音",
        "youon": "拗音"
    }
}
```

### 3.2 词汇 (vocabulary)

```json
// vocabulary/n5.json
{
    "level": "N5",
    "version": "1.0.0",
    "total": 800,
    "data": [
        {
            "id": "vocab_n5_001",
            "word": "食べる",
            "reading": "たべる",
            "romaji": "taberu",
            "meaning": {
                "zh": "吃",
                "en": "to eat",
                "ja": "口に物を入れて噛んで飲み込む"
            },
            "part_of_speech": "verb_ichidan",
            "verb_group": 2,
            "jlpt": "N5",
            "frequency": 95,
            "tags": ["日常", "饮食", "动词"],
            "conjugations": {
                "masu": "食べます",
                "nai": "食べない",
                "ta": "食べた",
                "te": "食べて",
                "potential": "食べられる",
                "passive": "食べられる",
                "causative": "食べさせる",
                "imperative": "食べろ",
                "volitional": "食べよう",
                "conditional": "食べれば"
            },
            "examples": [
                {
                    "ja": "毎朝パンを食べます。",
                    "reading": "まいあさパンをたべます。",
                    "zh": "每天早上吃面包。",
                    "en": "I eat bread every morning.",
                    "grammar_points": ["を", "ます"]
                },
                {
                    "ja": "何を食べたいですか？",
                    "reading": "なにをたべたいですか？",
                    "zh": "你想吃什么？",
                    "en": "What do you want to eat?",
                    "grammar_points": ["たい", "か"]
                }
            ],
            "related_words": ["飲む", "料理", "ご飯"],
            "common_mistakes": [
                {
                    "wrong": "食べるます",
                    "correct": "食べます",
                    "explanation": "一段动词去る加ます"
                }
            ]
        }
    ]
}
```

### 3.3 语法 (grammar)

```json
// grammar/n5.json
{
    "level": "N5",
    "version": "1.0.0",
    "total": 80,
    "data": [
        {
            "id": "grammar_n5_001",
            "title": "〜は〜です",
            "pattern": "名詞 + は + 名詞 + です",
            "meaning": {
                "zh": "...是...",
                "en": "... is ...",
                "ja": "〜は〜です (判断文)"
            },
            "jlpt": "N5",
            "category": "sentence_pattern",
            "explanation": {
                "zh": "最基本的判断句型。「は」是主题助词（读作wa），「です」是判断助动词（相当于'是'）。",
                "en": "The most basic sentence pattern. 'は' is the topic marker (read as 'wa'), 'です' is the copula ('is')."
            },
            "formation": [
                {
                    "pattern": "Aは B です",
                    "meaning": "A is B",
                    "example": "私は学生です"
                }
            ],
            "examples": [
                {
                    "ja": "私は学生です。",
                    "reading": "わたしはがくせいです。",
                    "zh": "我是学生。",
                    "en": "I am a student.",
                    "breakdown": [
                        {"text": "私", "role": "主题", "reading": "わたし"},
                        {"text": "は", "role": "主题助词", "reading": "wa"},
                        {"text": "学生", "role": "名词", "reading": "がくせい"},
                        {"text": "です", "role": "判断", "reading": "です"}
                    ]
                },
                {
                    "ja": "田中さんは先生です。",
                    "reading": "たなかさんはせんせいです。",
                    "zh": "田中先生是老师。",
                    "en": "Mr. Tanaka is a teacher."
                }
            ],
            "negative": {
                "pattern": "〜は〜ではありません / じゃないです",
                "example": "私は学生ではありません。"
            },
            "question": {
                "pattern": "〜は〜ですか",
                "example": "田中さんは先生ですか？"
            },
            "notes": [
                "「は」在此处读作「wa」而非「ha」",
                "「です」可省略（口语/非正式场合）"
            ],
            "related_grammar": ["grammar_n5_002", "grammar_n5_003"],
            "common_mistakes": [
                {
                    "wrong": "私が学生です",
                    "correct": "私は学生です",
                    "explanation": "一般自我介绍用「は」，「が」用于新信息或对比"
                }
            ],
            "sokoban_level_id": 1
        }
    ]
}
```

### 3.4 打字素材 (typing)

```json
// typing/beginner.json
{
    "level": "beginner",
    "version": "1.0.0",
    "data": [
        {
            "id": "typing_b_001",
            "title": "あ行练习",
            "mode": "romaji",
            "content": [
                {"display": "あ", "answer": "a"},
                {"display": "い", "answer": "i"},
                {"display": "う", "answer": "u"},
                {"display": "え", "answer": "e"},
                {"display": "お", "answer": "o"}
            ],
            "time_limit_sec": 60,
            "tags": ["平假名", "元音"]
        },
        {
            "id": "typing_b_010",
            "title": "简单单词",
            "mode": "word",
            "content": [
                {"display": "猫 (ねこ)", "answer": "neko"},
                {"display": "犬 (いぬ)", "answer": "inu"},
                {"display": "鳥 (とり)", "answer": "tori"},
                {"display": "魚 (さかな)", "answer": "sakana"}
            ],
            "time_limit_sec": 120,
            "tags": ["单词", "动物"]
        }
    ]
}
```

### 3.5 推箱子关卡 (sokoban)

```json
// games/sokoban-levels.json
{
    "version": "1.0.0",
    "total_levels": 60,
    "levels": [
        {
            "id": 1,
            "title": "助词「は」",
            "difficulty": "easy",
            "jlpt": "N5",
            "grammar_point": "grammar_n5_001",
            "target_sentence": {
                "ja": "私は学生です",
                "reading": "わたしはがくせいです",
                "zh": "我是学生",
                "en": "I am a student"
            },
            "grid": {
                "width": 6,
                "height": 5,
                "cells": [
                    [1, 1, 1, 1, 1, 1],
                    [1, 0, 0, 0, 0, 1],
                    [1, 0, 3, 0, 0, 1],
                    [1, 0, 0, 2, 4, 1],
                    [1, 1, 1, 1, 1, 1]
                ]
            },
            "legend": {
                "0": "floor",
                "1": "wall",
                "2": "box",
                "3": "target",
                "4": "player"
            },
            "boxes": [
                {
                    "id": "box_1",
                    "initial_position": [3, 3],
                    "label": "は",
                    "type": "particle",
                    "color": "#DC2E5A"
                }
            ],
            "targets": [
                {
                    "id": "target_1",
                    "position": [2, 2],
                    "expected_label": "は",
                    "hint": "主题标记"
                }
            ],
            "sentence_display": {
                "parts": [
                    {"text": "私", "fixed": true},
                    {"text": "?", "slot": true, "target_id": "target_1"},
                    {"text": "学生です", "fixed": true}
                ]
            },
            "min_moves": 5,
            "star_thresholds": [5, 8, 15],
            "hint": "「は」是主题标记助词，放在主题「私」后面"
        }
    ]
}
```

### 3.6 基础测验题 (quizzes)

```json
// quizzes/n5-quiz.json
{
    "level": "N5",
    "version": "1.0.0",
    "data": [
        {
            "id": "quiz_n5_001",
            "type": "choice",
            "category": "vocabulary",
            "related_item": "vocab_n5_001",
            "question": {
                "zh": "「食べる」的意思是？",
                "en": "What does 「食べる」 mean?",
                "ja": "「食べる」の意味は？"
            },
            "options": [
                {"text": "吃", "correct": true},
                {"text": "喝", "correct": false},
                {"text": "睡", "correct": false},
                {"text": "走", "correct": false}
            ],
            "explanation": {
                "zh": "食べる（たべる）是「吃」的意思，一段动词。",
                "en": "食べる (taberu) means 'to eat', an ichidan verb."
            }
        },
        {
            "id": "quiz_n5_050",
            "type": "fill",
            "category": "grammar",
            "related_item": "grammar_n5_001",
            "question": {
                "zh": "私___学生です。（填入合适的助词）",
                "en": "私___学生です。(Fill in the particle)"
            },
            "answer": "は",
            "acceptable_answers": ["は"],
            "explanation": {
                "zh": "「は」是主题标记助词，用于标记句子的主题。",
                "en": "'は' is the topic marker particle."
            }
        },
        {
            "id": "quiz_n5_100",
            "type": "translate",
            "category": "sentence",
            "question": {
                "zh": "请将「我每天学习日语」翻译成日语",
                "en": "Translate 'I study Japanese every day' into Japanese"
            },
            "answer": "私は毎日日本語を勉強します。",
            "acceptable_answers": [
                "私は毎日日本語を勉強します",
                "毎日日本語を勉強します",
                "私は毎日日本語を勉強する"
            ],
            "explanation": {
                "zh": "毎日(まいにち)=每天，日本語(にほんご)=日语，勉強(べんきょう)=学习"
            }
        },
        {
            "id": "quiz_n5_150",
            "type": "reorder",
            "category": "grammar",
            "question": {
                "zh": "请将以下词语排列成正确的日语句子",
                "en": "Arrange the words into a correct Japanese sentence"
            },
            "words": ["を", "食べます", "私は", "毎日", "ご飯"],
            "answer": ["私は", "毎日", "ご飯", "を", "食べます"],
            "answer_text": "私は毎日ご飯を食べます。"
        },
        {
            "id": "quiz_n5_200",
            "type": "listening",
            "category": "kana",
            "question": {
                "zh": "听音频，选择正确的假名",
                "en": "Listen and choose the correct kana"
            },
            "audio_text": "さくら",
            "options": [
                {"text": "さくら", "correct": true},
                {"text": "しくら", "correct": false},
                {"text": "さぐら", "correct": false},
                {"text": "すくら", "correct": false}
            ]
        }
    ]
}
```

## 四、TypeScript 类型定义

```typescript
// packages/question-bank/types.ts

export interface KanaItem {
    id: string
    char: string
    romaji: string
    row: string
    column: number
    category: 'gojuon' | 'dakuon' | 'handakuon' | 'youon'
    stroke_count: number
    mnemonic_zh: string
    mnemonic_en: string
    similar: string[]
    audio_text: string
}

export interface VocabItem {
    id: string
    word: string
    reading: string
    romaji: string
    meaning: { zh: string; en: string; ja?: string }
    part_of_speech: string
    jlpt: JLPTLevel
    frequency: number
    tags: string[]
    examples: VocabExample[]
    conjugations?: Record<string, string>
    related_words: string[]
}

export interface GrammarItem {
    id: string
    title: string
    pattern: string
    meaning: { zh: string; en: string }
    jlpt: JLPTLevel
    category: string
    explanation: { zh: string; en: string }
    examples: GrammarExample[]
    notes: string[]
}

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

export type QuizType = 'choice' | 'fill' | 'translate' | 'reorder' | 'listening'
```

### 4.1 推荐补充的通用类型

为了支持 manifest + packs 结构，建议后续补充下面这类通用类型：

```typescript
export interface BankManifest {
    version: string
    schema_version: string
    modules: ModuleManifest[]
    games?: GameContentManifest[]
}

export interface ModuleManifest {
    module: string
    title: string
    description?: string
    packs: PackRef[]
}

export interface PackRef {
    id: string
    path: string
    version: string
    schema_version: string
    tags?: string[]
    jlpt?: JLPTLevel[]
    difficulty?: string
    status?: 'draft' | 'published' | 'deprecated'
}

export interface BasePack<T> {
    id: string
    module: string
    type: string
    version: string
    schema_version: string
    title: string
    data: T[]
}
```

这些类型的价值主要是：

- 统一校验
- 统一索引
- 统一导出
- 新增模块时少改公共逻辑

## 五、数据来源与质量

### 5.1 数据来源
- 假名：标准五十音图
- 词汇：JLPT官方词汇表 + 常用词频统计
- 语法：JLPT语法大纲 + 主流教材整理
- 例句：教材例句 + 人工编写

### 5.2 质量要求
- 所有日文内容必须有读音标注
- 所有内容提供中英双语释义
- 例句需自然、实用
- 定期校对更新
- 版本号管理，方便增量更新

## 六、数据校验流程

### 6.1 校验目标

题库校验的目标是保证：

- JSON 格式合法
- 字段完整
- 字段类型正确
- 枚举值合法
- 引用关系可追踪
- 多语言字段尽量齐全

### 6.2 校验范围

建议至少校验下面这些内容：

1. 文件是否能正常解析
2. 顶层字段是否存在，如 `version`、`data`
3. 每条记录的 `id` 是否唯一
4. 枚举字段是否落在允许范围
5. 引用字段是否能找到对应目标
6. 文本字段是否为空字符串或缺失

### 6.3 校验阶段

建议按 3 个阶段做：

- **录入时校验**：新增或修改题库时本地先跑校验
- **提交时校验**：CI 中阻断格式错误和明显脏数据
- **发布前抽检**：对关键题库做人工抽样检查

### 6.4 建议脚本能力

建议后续补充题库校验脚本，至少支持：

- 检查 JSON 结构
- 检查重复 ID
- 检查缺失字段
- 检查非法枚举值
- 检查跨文件引用
- 输出错误文件和错误位置

## 七、版本兼容策略

### 7.1 版本字段约定

每份题库文件都应带 `version` 字段，用于标识数据格式或内容版本。

建议规则：

- **小版本**：只补内容，不改结构
- **次版本**：字段有新增，但保持兼容
- **大版本**：字段结构发生不兼容变化

### 7.2 兼容原则

1. 前端和后端优先兼容旧字段，不轻易直接删字段。
2. 如需废弃字段，先经历“保留但不再使用”的过渡期。
3. 涉及跨端消费的数据结构变更，必须同步更新文档和类型定义。

### 7.3 版本升级建议

当题库结构升级时，建议同步做下面几件事：

- 更新 `question-bank-spec.md`
- 更新 `packages/question-bank/types.ts`
- 补充迁移或兼容逻辑
- 记录受影响模块

## 八、导入导出流程

### 8.1 导入流程建议

推荐流程：

1. 准备原始题库文件
2. 跑结构校验
3. 跑引用校验
4. 抽样人工检查
5. 合并到 `packages/question-bank/`
6. 联调确认前后端都能正常消费

### 8.2 导出流程建议

如后续需要导出给编辑、翻译或审核人员，建议支持：

- 按模块导出
- 按 JLPT 等级导出
- 按语言字段导出
- 导出缺失翻译项

### 8.3 导入原则

- 题库导入不能绕过校验
- 批量导入要支持失败回滚或至少输出失败明细
- 导入脚本应支持重复执行且避免重复数据

## 九、来源、版权与维护说明

### 9.1 数据来源原则

题库内容建议优先来自：

- 标准五十音图
- JLPT 官方范围或公开整理资料
- 主流教材归纳
- 团队自编例句和题目

### 9.2 版权注意事项

建议遵循：

- 不直接整段复制受版权保护教材内容
- 引用公开资料时记录来源
- 自编题目与例句优先
- 如使用第三方开放数据，保留许可证信息

### 9.3 维护责任建议

题库维护建议区分角色：

- 内容维护：负责词汇、语法、例句正确性
- 技术维护：负责结构、校验、导入导出
- 发布维护：负责版本标记和变更记录

### 9.4 变更记录建议

每次较大的题库更新，建议至少记录：

- 变更日期
- 变更范围
- 新增条目数
- 删除或修正条目数
- 是否涉及结构变更

## 十、可扩展设计建议

### 10.1 新增题型时怎么做

新增题型时，建议按下面顺序做：

1. 在 `modules/` 下新增模块目录
2. 增加该模块 `manifest.json`
3. 定义该模块 pack 结构
4. 更新类型定义
5. 增加校验规则
6. 更新前后端消费逻辑

### 10.2 新增内容包时怎么做

新增内容包时，推荐只做这几步：

1. 新建 pack 文件
2. 在模块 manifest 里注册
3. 跑校验
4. 补变更记录

不建议每次加内容都去扩核心目录结构。

### 10.3 新增游戏内容时怎么做

新增游戏内容建议分两种情况：

- **已有游戏新增 pack / level-pack**
- **新增全新游戏类型**

前者主要补内容，后者才需要同步补游戏规则设计。

### 10.4 为什么这样更方便维护

因为后续能把维护动作拆开：

- 改内容 → 主要改 pack
- 改注册 → 主要改 manifest
- 改结构 → 主要改 schema / types
- 改玩法 → 主要改 `game-design.md`

这样题库和游戏内容越多，越不容易继续堆成少数几个超大文件。
