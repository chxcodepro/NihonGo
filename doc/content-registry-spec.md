# 内容注册规范

## 一、文档目的

这份文档专门定义题库和游戏内容的注册规则，用来解决下面几个问题：

- 新增模块时怎么接入
- 新增内容包时怎么注册
- 游戏内容和学习内容怎么统一管理
- manifest、pack、关卡包分别负责什么
- 命名和校验怎么统一

这份文档和 `question-bank-spec.md` 的关系是：

- `question-bank-spec.md`：讲内容长什么样
- `content-registry-spec.md`：讲内容怎么注册、怎么索引、怎么接入系统

## 二、设计目标

内容注册体系的目标：

1. 降低新增题型和新增游戏的接入成本
2. 避免所有内容都堆在少数几个大文件里
3. 支持统一校验、统一索引、统一导出
4. 让前后端都能按同一套清单读取内容

## 三、核心概念

### 3.1 manifest

manifest 是注册表，负责描述“有哪些内容”。

### 3.2 pack

pack 是最小可维护内容包，负责承载实际数据。

### 3.3 module

module 是学习内容的大类，例如：

- kana
- vocabulary
- grammar
- typing
- quizzes

### 3.4 game content

game content 是游戏使用的内容包，例如：

- `typing-race` 的文本内容包
- `sokoban` 的关卡包

## 四、推荐目录结构

```text
packages/question-bank/
├── index.ts
├── manifest.json
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
    ├── typing-race/
    │   ├── manifest.json
    │   └── packs/
    └── sokoban/
        ├── manifest.json
        └── levels/
```

## 五、总 manifest 规范

### 5.1 顶层结构示例

```json
{
    "version": "1.0.0",
    "schema_version": "1.0.0",
    "modules": [
        {
            "module": "vocabulary",
            "title": "词汇",
            "manifest_path": "modules/vocabulary/manifest.json"
        }
    ],
    "games": [
        {
            "game_id": "typing-race",
            "title": "打字竞速",
            "manifest_path": "games/typing-race/manifest.json"
        }
    ]
}
```

## 六、模块 manifest 规范

```json
{
    "module": "vocabulary",
    "title": "词汇",
    "version": "1.0.0",
    "schema_version": "1.0.0",
    "packs": [
        {
            "id": "vocabulary_jlpt_n5_core",
            "path": "modules/vocabulary/packs/jlpt-n5-core.json",
            "version": "1.0.0",
            "schema_version": "1.0.0",
            "tags": ["jlpt", "n5", "core"],
            "status": "published"
        }
    ]
}
```

要求：

- `module` 必须唯一
- `packs[].id` 在模块内必须唯一
- `path` 必须指向真实存在的文件

## 七、游戏 manifest 规范

```json
{
    "game_id": "sokoban",
    "title": "推箱子记语法",
    "game_type": "grid_puzzle",
    "version": "1.0.0",
    "schema_version": "1.0.0",
    "content_source": {
        "module": "grammar"
    },
    "packs": [
        {
            "id": "sokoban_n5_particles_01",
            "path": "games/sokoban/levels/n5-pack-01.json",
            "version": "1.0.0",
            "schema_version": "1.0.0",
            "tags": ["n5", "particles"],
            "status": "published"
        }
    ]
}
```

## 八、通用字段建议

推荐所有 pack 统一带：

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
- `data`

## 九、命名规则

### 9.1 module 命名

- `kana`
- `vocabulary`
- `grammar`
- `typing`
- `quizzes`

### 9.2 pack 命名

建议格式：

```text
<模块>_<范围>_<主题>_<序号>
```

示例：

- `vocabulary_jlpt_n5_core`
- `typing_sentence_beginner_01`
- `sokoban_n5_particles_01`

## 十、注册流程

### 10.1 新增模块

1. 建目录
2. 增加模块 manifest
3. 增加 pack 文件
4. 注册到总 manifest
5. 跑校验

### 10.2 新增 pack

1. 新建 pack 文件
2. 注册到模块 manifest
3. 跑校验
4. 更新变更记录

### 10.3 新增游戏

1. 新增 `games/<game-id>/`
2. 增加游戏 manifest
3. 增加内容 pack 或 level-pack
4. 注册到总 manifest
5. 同步更新 `game-design.md`

## 十一、校验规则

建议至少校验：

- manifest JSON 合法
- pack JSON 合法
- `id` 唯一
- `path` 存在
- `schema_version` 合法
- `status` 在允许范围

## 十二、版本兼容建议

- `version`：内容版本
- `schema_version`：结构版本
- 新字段尽量向后兼容
- 删除字段要有过渡期

## 十三、维护建议

建议把维护责任拆开：

- 内容维护：负责内容质量
- 结构维护：负责 manifest / schema / 校验
- 发布维护：负责版本、状态、变更记录

## 十四、一句话原则

**用 manifest 管注册，用 pack 管内容，用规则文档管玩法，用校验保证不失控。**
