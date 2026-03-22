# 游戏设计文档

## 一、设计目标与扩展原则

- 通过游戏化提升日语学习的趣味性和记忆效果
- 简单易上手，不需要额外教学成本
- 游戏内容紧密关联日语知识点
- 适合零基础到高级学习者

### 1.1 统一游戏模型

为了方便后续新增游戏模式、复用题库内容、统一实现和维护，游戏系统建议采用**注册式 + 配置式**设计。

建议每个游戏都具备下面这套统一描述：

```json
{
    "game_id": "typing-race",
    "game_type": "real_time_typing",
    "title": "打字竞速",
    "content_source": {
        "module": "typing",
        "pack_selector": ["beginner", "jlpt-n5"]
    },
    "rule_config": {},
    "score_config": {},
    "progression_config": {},
    "ui_config": {}
}
```

### 1.2 统一分层

建议每个游戏都拆成 4 层：

1. 游戏定义层：游戏是什么
2. 规则配置层：怎么玩、怎么判赢、怎么计分
3. 内容供应层：题目、句子、关卡、语法点从哪里来
4. 运行状态层：当前进度、结果、历史记录

### 1.3 这样做的好处

- 新增游戏时不用重造一套结构
- 前端可以统一做游戏目录和入口
- 后端可以统一做配置、内容读取和成绩提交
- 游戏内容可以复用题库 pack，减少重复维护

### 1.4 游戏内容与规则分离

建议把：

- 游戏规则
- 游戏内容
- 评分配置
- UI 表现

分开管理。

这样后面：

- 改内容，不容易碰规则
- 改规则，不需要重做全部关卡
- 新增游戏，也更容易复用现有内容体系

---

## 二、打字竞速 (Typing Race)

### 2.1 概述

玩家与AI进行打字速度比赛，AI以固定速度"打字"，玩家需要尽可能快且准确地输入日文内容。

### 2.2 游戏流程

```
选择难度 → 选择内容类型 → 3秒倒计时 → 开始比赛
    │                                      │
    │  ┌──────────────────────────────┐     │
    │  │  AI进度条:  ████████░░░░░ 67% │     │
    │  │  你的进度:  ███░░░░░░░░░ 25%  │     │
    │  │                              │     │
    │  │  待输入: おはようございます     │     │
    │  │  你的输入: ohayo_             │     │
    │  │                              │     │
    │  │  WPM: 45  正确率: 96%  00:32 │     │
    │  └──────────────────────────────┘     │
    │                                      │
    └── 比赛结束 → 显示结果 → 重来/换内容
```

### 2.3 难度设定

| 难度 | AI速度 (字符/分钟) | 内容范围 | 适合人群 |
|------|-------------------|---------|---------|
| 初学者 | 30 CPM | 平假名单字/简单词 | 刚接触日语 |
| 中级 | 60 CPM | 常用词汇/短句 | N5-N4水平 |
| 高手 | 120 CPM | 完整句子/段落 | N3+水平 |

### 2.4 内容类型

| 类型 | 输入方式 | 示例 |
|------|---------|------|
| 平假名 | 罗马音 → 假名 | 显示「あ」输入「a」 |
| 片假名 | 罗马音 → 假名 | 显示「ア」输入「a」 |
| 单词 | 罗马音拼写 | 显示「食べる」输入「taberu」 |
| 句子 | 罗马音拼写 | 显示「おはようございます」输入「ohayougozaimasu」 |

### 2.5 评分规则

```
最终得分 = 基础分 × 正确率加成

基础分 = WPM × 难度系数
难度系数: 初学者=1.0, 中级=1.5, 高手=2.0
正确率加成: 正确率 >= 95% → ×1.2
           正确率 >= 90% → ×1.0
           正确率 >= 80% → ×0.8
           正确率 < 80%  → ×0.6

结果判定:
- 玩家进度 > AI进度: 胜利 🎉
- 玩家进度 = AI进度: 平局 🤝
- 玩家进度 < AI进度: 失败 💪 (显示鼓励语)
```

### 2.6 UI设计

```
┌──────────────────────────────────────────┐
│  🏁 打字竞速                    ⏱ 01:23  │
├──────────────────────────────────────────┤
│                                          │
│  AI 🤖  ████████████░░░░░░  67%  60CPM   │
│  你 👤  █████░░░░░░░░░░░░  33%  45CPM   │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│   おはようございます。今日はいい天気ですね。│
│   ^^^^^^^^                              │
│   已完成部分(绿色)                        │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ohayougozaimasu. kyouha            │  │
│  └────────────────────────────────────┘  │
│                                          │
│  WPM: 45  │  正确率: 96%  │  错误: 2    │
│                                          │
└──────────────────────────────────────────┘
```

### 2.7 技术实现要点

```typescript
// 打字竞速核心逻辑
interface TypingRaceState {
    content: string[]           // 待输入内容数组
    playerIndex: number         // 玩家当前位置
    aiIndex: number             // AI当前位置
    aiSpeed: number             // AI速度 (CPM)
    startTime: number
    errors: number
    totalTyped: number
}

// AI模拟打字 (匀速推进)
function updateAI(state: TypingRaceState, elapsed: number) {
    const aiCharsPerMs = state.aiSpeed / 60000
    state.aiIndex = Math.min(
        Math.floor(elapsed * aiCharsPerMs),
        state.content.length
    )
}
```

### 2.8 可扩展设计建议

打字竞速不建议把内容写死在游戏内部，推荐：

- 游戏规则固定
- 内容从 `question-bank` 的 typing pack 动态读取
- 难度、内容类型、节奏参数走配置

推荐支持的扩展维度：

- 内容来源：kana / word / sentence / mixed
- 难度档位：beginner / intermediate / advanced / custom
- 目标人群：JLPT N5 ~ N1
- 模式扩展：单机对 AI、限时模式、生存模式、挑战模式

---

## 三、推箱子记语法 (Sokoban Grammar)

### 3.1 概述

经典推箱子玩法，箱子上标记日语语法成分（助词、词性等），将箱子推到正确位置组成合法的日语句子。

### 3.2 核心玩法

```
目标: 将标有语法成分的箱子推到正确的目标位置，组成正确的日语句子。

例: 组成「私は学生です」

  ┌─┬─┬─┬─┬─┬─┬─┐
  │ │ │█│█│█│ │ │
  │ │ │█│⬜│█│ │ │     ⬜ = 目标位置 (は)
  │█│█│█│ │█│█│█│     📦 = 箱子 [は]
  │█│ │📦│ │★│ │█│     ★ = 玩家
  │█│█│█│█│█│█│█│
  └─┴─┴─┴─┴─┴─┴─┘

推动 [は] 到 ⬜ 位置 → 句子完成！
```

### 3.3 关卡设计

#### 难度分级

| 难度 | JLPT | 关卡数 | 语法内容 | 网格大小 |
|------|------|--------|---------|---------|
| 入门 | N5 | 15关 | は/が/を/に/で/の | 5×5 ~ 6×6 |
| 初级 | N5-N4 | 15关 | 助词组合、形容词 | 6×6 ~ 7×7 |
| 中级 | N4-N3 | 15关 | 动词变形、连接 | 7×7 ~ 8×8 |
| 高级 | N3-N2 | 10关 | 复杂语法、敬语 | 8×8 ~ 9×9 |
| 挑战 | N2-N1 | 5关 | 多箱子组合 | 9×9+ |

#### 关卡示例

**关卡1 (入门 - 助词は):**
```json
{
    "id": 1,
    "title": "助词「は」的位置",
    "difficulty": "easy",
    "grammar_point": "は (主题标记)",
    "target_sentence": "私は学生です",
    "meaning": "我是学生",
    "grid": {
        "width": 6,
        "height": 5,
        "walls": [[0,0],[0,1],...],
        "player": [3, 4],
        "boxes": [
            {"position": [2, 3], "label": "は", "type": "particle"}
        ],
        "targets": [
            {"position": [2, 1], "expected": "は"}
        ]
    },
    "hint": "「は」放在主题「私」的后面",
    "min_moves": 8,
    "star_thresholds": [8, 12, 20]
}
```

**关卡10 (初级 - 多个助词):**
```json
{
    "id": 10,
    "title": "助词排列",
    "target_sentence": "私は毎日学校で日本語を勉強します",
    "meaning": "我每天在学校学习日语",
    "boxes": [
        {"label": "は", "type": "particle"},
        {"label": "で", "type": "particle"},
        {"label": "を", "type": "particle"}
    ],
    "targets": [
        {"position": [1, 2], "expected": "は"},
        {"position": [3, 2], "expected": "で"},
        {"position": [5, 2], "expected": "を"}
    ]
}
```

### 3.4 星级评价

```
⭐⭐⭐ (3星): 步数 <= 最少步数 × 1.2
⭐⭐   (2星): 步数 <= 最少步数 × 1.8
⭐     (1星): 完成即可
```

### 3.5 游戏UI

```
┌──────────────────────────────────────────┐
│  📦 推箱子记语法        关卡 3/60  ⭐⭐⭐│
├──────────────────────────────────────────┤
│                                          │
│   目标句子:  私 [?] 学生です              │
│   翻译:     我是学生                      │
│                                          │
│   ┌──┬──┬──┬──┬──┬──┐                   │
│   │██│██│██│██│██│██│                   │
│   │██│  │⬜│  │  │██│                   │
│   │██│  │  │📦│  │██│    📦 = [は]      │
│   │██│  │  │  │★│██│    ★ = 你         │
│   │██│██│██│██│██│██│    ⬜ = 目标       │
│   └──┴──┴──┴──┴──┴──┘                   │
│                                          │
│   步数: 5/8  │  [↶ 撤销] [🔄 重置]      │
│                                          │
│   提示: 「は」放在主题后面                 │
│                                          │
└──────────────────────────────────────────┘
```

### 3.6 交互设计

| 操作 | Web | Mobile | Desktop |
|------|-----|--------|---------|
| 移动 | WASD / 方向键 | 滑动手势 | WASD / 方向键 |
| 撤销 | Ctrl+Z | 撤销按钮 | Ctrl+Z |
| 重置 | R | 重置按钮 | R |
| 提示 | H | 提示按钮 | H |

### 3.7 技术实现

```typescript
// 推箱子核心逻辑
interface SokobanState {
    grid: CellType[][]       // 网格
    player: Position         // 玩家位置
    boxes: Box[]             // 箱子列表
    targets: Target[]        // 目标位置
    moves: Move[]            // 移动历史 (撤销用)
    moveCount: number
    completed: boolean
}

interface Box {
    id: string
    position: Position
    label: string            // 显示的语法文字
    type: 'particle' | 'verb' | 'adjective' | 'noun'
    onTarget: boolean        // 是否在目标位置上
}

type Direction = 'up' | 'down' | 'left' | 'right'

function move(state: SokobanState, dir: Direction): SokobanState {
    const newPlayerPos = getNextPosition(state.player, dir)

    // 碰墙检测
    if (isWall(state.grid, newPlayerPos)) return state

    // 箱子检测
    const box = state.boxes.find(b => posEqual(b.position, newPlayerPos))
    if (box) {
        const newBoxPos = getNextPosition(newPlayerPos, dir)
        // 箱子后面是墙或另一个箱子 → 不能推
        if (isWall(state.grid, newBoxPos) || hasBox(state.boxes, newBoxPos)) {
            return state
        }
        // 推箱子
        return pushBox(state, box, newBoxPos, newPlayerPos)
    }

    // 直接移动
    return movePlayer(state, newPlayerPos)
}

// 检查是否通关
function checkWin(state: SokobanState): boolean {
    return state.targets.every(target => {
        const box = state.boxes.find(b => posEqual(b.position, target.position))
        return box && box.label === target.expected
    })
}
```

### 3.8 通关动画

```
通关时:
1. 所有箱子变绿 + 轻微弹跳动画
2. 完整句子在上方高亮显示
3. 星级评价动画 (星星依次亮起)
4. 语法知识点卡片弹出 (可选查看)
5. 按钮: [下一关] [重玩] [返回列表]

失败时 (无法移动/选择重置):
- 不显示失败界面，只允许撤销或重置
- 推箱子没有"输"的概念，只有完成或未完成
```

### 3.9 可扩展设计建议

推箱子模块建议把“规则”和“关卡内容”分离：

- 规则固定：移动、推箱、撤销、判赢、评分
- 内容可扩展：地图、箱子、目标点、句子、语法点、提示

推荐一个关卡包不要太大，按主题拆分，比如：

- N5 助词入门包
- N4 动词变形包
- N3 连接表达包

这样后面：

- 新增关卡只改 level pack
- 调整判定规则只改游戏逻辑
- 替换文案和句子只改内容文件

---

## 四、未来游戏扩展方向

以下游戏可在后续版本中添加:

| 游戏 | 类型 | 学习内容 | 优先级 |
|------|------|---------|--------|
| 单词连连看 | 匹配 | 日文↔中文配对 | P1 |
| 假名消消乐 | 消除 | 假名识别速度 | P2 |
| 语法填词 | 填空 | 语法应用 | P2 |
| 听力快打 | 听写 | 听力+打字 | P3 |

## 五、统一接入建议

### 5.1 统一游戏接口方向

为了方便后续接新游戏，建议统一接口思路：

- 获取游戏目录：`/api/game/catalog`
- 获取游戏配置：`/api/game/:gameId/config`
- 获取游戏内容：`/api/game/:gameId/content`
- 提交游戏记录：`/api/game/:gameId/record`

### 5.2 新游戏接入顺序

后续新增游戏时，建议按下面顺序接入：

1. 在游戏清单里注册 `game_id`
2. 定义规则配置结构
3. 明确内容来源模块
4. 增加对应 pack 或关卡数据
5. 接入统一接口
6. 补测试和文档
