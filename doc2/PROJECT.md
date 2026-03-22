# 日本語学習アプリ (NihonGo) - 项目规划

## 一、项目概述

一款面向零基础到高手的日语学习应用，支持 Web / Desktop / Mobile 三端同步，集打字练习、AI对话、小游戏于一体，免费开源，Docker一键部署。

## 二、技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **Web前端** | Next.js 15 + React 19 + Tailwind CSS 4 + shadcn/ui + Framer Motion | 最强UI交互生态 |
| **移动端** | Expo (React Native) + NativeWind + Reanimated | Android / iOS，共享逻辑，支持 EAS Update |
| **桌面端** | Tauri v2 | 支持 Windows / macOS / Linux，多平台安装包与内置更新 |
| **后端** | Go 1.22 + Gin + GORM | 高并发，4H6G扛5000+连接 |
| **数据库** | PostgreSQL 16 | 用户/题库/学习记录 |
| **缓存** | Redis 7 | Session/限流/TTS缓存/排行 |
| **代码管理** | Turborepo monorepo | 三端共享组件/类型/工具函数 |
| **部署** | Docker Compose + NPM | 业务栈容器化，网关使用 Nginx Proxy Manager |
| **CI/CD** | GitHub Actions + GHCR + EAS | 自动构建镜像、桌面端安装包、移动端产物并自动部署服务端 |

## 三、核心功能模块

### 3.1 认证系统
- **OAuth2登录**: Google / GitHub / LinuxDo Connect
  - LinuxDo端点: `connect.linux.do/oauth2/authorize` → `token` → `/api/user`
- **邮箱注册登录**: SMTP验证码，拒绝临时邮箱（维护黑名单域名列表）
- **手机号登录**: 预留接口，暂不实现
- **无需登录**: 所有功能可离线/匿名使用，登录后同步数据
- **JWT + Refresh Token**: Access Token 15min，Refresh Token 7天

### 3.2 学习模块

#### 3.2.1 五十音图
- 平假名/片假名交互式表格
- 点击即发音（Web Speech API，日语语音）
- 笔顺动画演示（SVG动画）
- 记忆小测验（看假名写罗马音、听音选字）

#### 3.2.2 词汇学习
- JLPT N5→N1 分级词库
- 单词卡片（正面日文，反面释义+例句）
- 间隔重复算法（SM-2）自动安排复习
- 点击TTS即时发音

#### 3.2.3 语法学习
- 结构化语法课程（初级→高级）
- 每条语法：解释 + 例句 + 变形规则
- 语法填空/选择练习
- 推箱子语法游戏联动

#### 3.2.4 打字练习（金山打字通模式）
- **罗马音输入练习**: 看假名打罗马音
- **假名输入练习**: 看罗马音打假名
- **单词打字**: 看中文/英文打日文
- **句子打字**: 看翻译打完整句子
- 实时正确率 / WPM / 错误统计
- 难度递进：字母→假名→单词→短句→段落

#### 3.2.5 AI对话学习（需登录）
- 场景对话：自我介绍、点餐、问路、面试等
- AI实时纠错 + 语法解释
- 对话历史保存
- 支持自定义模型 baseURL + apiKey
- 内置默认AI配置（网站部署时预设）
- SSE流式输出，打字机效果

#### 3.2.6 AI智能出题
- 学完知识点后AI实时生成练习题
- 题型：选择题/填空题/翻译题/排序题
- 基础题库（JSON）作为兜底，AI题作为补充
- 错题自动收录，定期复习

### 3.3 小游戏

#### 3.3.1 打字竞速（人机对战）
- 玩家 vs AI（固定速度，如 60/120/180 字符/分钟）
- 实时进度条对比
- 不设排行榜，纯个人挑战
- 3个难度：初学者/中级/高手

#### 3.3.2 推箱子记语法
- 经典推箱子玩法
- 箱子上标语法成分（主语/谓语/助词等）
- 推到正确位置组成合法句子
- 关卡由易到难，覆盖N5→N1语法

#### 3.3.3 游戏系统设计原则
- 游戏采用注册式设计，方便后续新增玩法
- 游戏规则、游戏内容、评分配置分层管理
- 游戏内容优先复用题库和内容包，不单独维护一套杂乱数据
- 新增游戏时尽量复用统一接口和统一记录结构

### 3.4 版本更新
- **Web端**: 部署即更新，无需额外处理
- **桌面端 (Tauri)**: tauri-plugin-updater 内置更新检测
  - 启动时检查更新 + 设置页手动检查
  - 显示更新日志，用户确认后下载安装
  - 更新源：GitHub Releases
- **移动端**:
  - 优先使用 EAS Update 做应用内热更新
  - Android 原生大版本可跳转下载页或商店
  - iOS 原生大版本通过 App Store / TestFlight 分发
- **后端API**: `/api/version/check` 返回最新版本信息

### 3.5 多语言 (i18n)
- 中文 (zh-CN) / 英文 (en) / 日文 (ja)
- 使用 next-intl (Web) + i18n-js (Mobile)
- 跟随系统语言，支持手动切换

### 3.6 主题
- 明/暗两色，跟随系统 + 手动切换
- Tailwind CSS dark mode + CSS变量
- 所有组件适配两种主题

### 3.7 TTS语音
- **主方案**: Web Speech API（浏览器内置）
  - 优先选日语语音（ja-JP）
  - 点击即出声，零延迟零成本
- **Tauri桌面端**: 调用系统TTS引擎
- **移动端**: expo-speech（调用系统TTS）
- 常用发音预缓存到 Redis（备用）

## 四、项目目录结构

```
jp-study/
├── apps/
│   ├── web/                    # Next.js 15 Web应用
│   │   ├── app/                # App Router
│   │   │   ├── (auth)/         # 认证相关页面
│   │   │   ├── (learn)/        # 学习模块
│   │   │   ├── (game)/         # 游戏模块
│   │   │   ├── (settings)/     # 设置页
│   │   │   └── api/            # BFF层（可选）
│   │   ├── components/         # Web专用组件
│   │   └── public/             # 静态资源
│   │
│   ├── mobile/                 # Expo React Native
│   │   ├── app/                # Expo Router
│   │   ├── components/         # Mobile专用组件
│   │   └── assets/             # 移动端资源
│   │
│   └── desktop/                # Tauri v2 壳
│       ├── src-tauri/          # Rust配置
│       └── ...                 # 复用web构建产物
│
├── packages/
│   ├── ui/                     # 共享UI组件库
│   │   ├── components/         # Button, Card, Modal...
│   │   └── styles/             # 共享样式/主题
│   │
│   ├── shared/                 # 共享逻辑
│   │   ├── types/              # TypeScript类型定义
│   │   ├── utils/              # 工具函数
│   │   ├── hooks/              # 共享React Hooks
│   │   ├── store/              # 状态管理 (Zustand)
│   │   └── api/                # API Client封装
│   │
│   ├── i18n/                   # 多语言资源
│   │   ├── locales/
│   │   │   ├── zh-CN.json
│   │   │   ├── en.json
│   │   │   └── ja.json
│   │   └── index.ts
│   │
│   └── question-bank/          # 题库与游戏内容仓库
│       ├── manifest.json       # 总清单
│       ├── modules/            # 学习内容模块
│       │   ├── kana/
│       │   ├── vocabulary/
│       │   ├── grammar/
│       │   ├── typing/
│       │   └── quizzes/
│       └── games/              # 游戏内容包
│           ├── typing-race/
│           └── sokoban/
│
├── server/                     # Go后端
│   ├── cmd/
│   │   └── server/
│   │       └── main.go         # 入口
│   ├── internal/
│   │   ├── config/             # 配置管理
│   │   ├── middleware/          # JWT认证/限流/CORS
│   │   ├── handler/            # HTTP处理器
│   │   │   ├── auth.go         # 认证相关
│   │   │   ├── learn.go        # 学习模块
│   │   │   ├── ai.go           # AI代理
│   │   │   ├── game.go         # 游戏相关
│   │   │   └── version.go      # 版本检查
│   │   ├── service/            # 业务逻辑
│   │   ├── model/              # 数据模型 (GORM)
│   │   ├── repository/         # 数据访问层
│   │   └── pkg/
│   │       ├── oauth/          # OAuth2客户端
│   │       ├── email/          # 邮件发送
│   │       ├── ai/             # AI API代理
│   │       └── disposable/     # 临时邮箱黑名单
│   ├── migrations/             # 数据库迁移
│   ├── go.mod
│   └── go.sum
│
├── docker/
│   ├── Dockerfile.server       # Go后端镜像
│   ├── Dockerfile.web          # Next.js镜像
│   ├── docker-compose.yml      # 业务栈部署
│   └── scripts/                # 更新脚本
│
├── .github/
│   └── workflows/
│       ├── deploy-server.yml   # 镜像构建 + 自动部署
│       ├── desktop-build.yml   # Tauri构建 Windows/macOS/Linux
│       └── mobile-build.yml    # Expo EAS构建 Android/iOS
│
├── turbo.json                  # Turborepo配置
├── package.json                # 根package.json
├── pnpm-workspace.yaml         # pnpm workspace
└── PROJECT.md                  # 本文件
```

## 五、数据库设计

### users 用户表
```sql
id              BIGSERIAL PRIMARY KEY
email           VARCHAR(255) UNIQUE       -- 可空（OAuth用户可能无邮箱）
password_hash   VARCHAR(255)              -- 邮箱注册用户
username        VARCHAR(100) NOT NULL
avatar_url      TEXT
provider        VARCHAR(50)               -- google/github/linuxdo/email
provider_id     VARCHAR(255)              -- 第三方用户ID
email_verified  BOOLEAN DEFAULT FALSE
locale          VARCHAR(10) DEFAULT 'zh-CN'
theme           VARCHAR(10) DEFAULT 'system'
ai_base_url     TEXT                      -- 自定义AI接口
ai_api_key      TEXT                      -- 加密存储
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### learning_progress 学习进度
```sql
id              BIGSERIAL PRIMARY KEY
user_id         BIGINT REFERENCES users(id)
module          VARCHAR(50)               -- hiragana/katakana/vocab/grammar
item_id         VARCHAR(100)              -- 具体知识点ID
level           INT DEFAULT 0             -- SRS等级
next_review     TIMESTAMPTZ               -- 下次复习时间
review_count    INT DEFAULT 0
correct_count   INT DEFAULT 0
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### typing_records 打字记录
```sql
id              BIGSERIAL PRIMARY KEY
user_id         BIGINT REFERENCES users(id)
mode            VARCHAR(50)               -- romaji/kana/word/sentence
wpm             FLOAT
accuracy        FLOAT
duration_sec    INT
content_id      VARCHAR(100)
created_at      TIMESTAMPTZ
```

### ai_conversations AI对话
```sql
id              BIGSERIAL PRIMARY KEY
user_id         BIGINT REFERENCES users(id)
title           VARCHAR(255)
scenario        VARCHAR(100)              -- 对话场景
messages        JSONB                     -- 消息历史
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### game_records 游戏记录
```sql
id              BIGSERIAL PRIMARY KEY
user_id         BIGINT REFERENCES users(id)
game_type       VARCHAR(50)               -- typing_race/sokoban
score           INT
level           INT
metadata        JSONB                     -- 游戏详情
created_at      TIMESTAMPTZ
```

### app_versions 版本信息
```sql
id              SERIAL PRIMARY KEY
platform        VARCHAR(20)               -- web/desktop/android/ios
version         VARCHAR(20)               -- semver: 1.0.0
download_url    TEXT
changelog       TEXT
force_update    BOOLEAN DEFAULT FALSE
created_at      TIMESTAMPTZ
```

## 六、API路由设计

```
# === 认证 ===
POST   /api/auth/register          # 邮箱注册
POST   /api/auth/login             # 邮箱登录
POST   /api/auth/verify-email      # 验证邮箱验证码
POST   /api/auth/refresh           # 刷新Token
POST   /api/auth/logout            # 登出
GET    /api/auth/oauth/:provider   # OAuth2发起 (google/github/linuxdo)
GET    /api/auth/callback/:provider # OAuth2回调

# === 用户 ===
GET    /api/user/profile           # 获取个人信息
PUT    /api/user/profile           # 更新个人信息
PUT    /api/user/ai-config         # 更新AI配置
DELETE /api/user/account           # 注销账户

# === 学习 ===
GET    /api/learn/kana             # 五十音数据
GET    /api/learn/vocabulary       # 词汇列表（分页/分级）
GET    /api/learn/grammar          # 语法列表
GET    /api/learn/progress         # 学习进度
POST   /api/learn/progress         # 更新进度
GET    /api/learn/review           # 获取待复习项（SRS）

# === 打字 ===
GET    /api/typing/content         # 获取打字内容
POST   /api/typing/record          # 提交打字记录
GET    /api/typing/stats           # 打字统计

# === AI ===
POST   /api/ai/chat                # AI对话（SSE流式）
POST   /api/ai/generate-quiz       # AI生成题目
GET    /api/ai/conversations       # 对话列表
GET    /api/ai/conversations/:id   # 对话详情

# === 游戏 ===
GET    /api/game/catalog            # 游戏目录
GET    /api/game/:gameId/config     # 游戏配置
GET    /api/game/:gameId/content    # 游戏内容
POST   /api/game/:gameId/record     # 提交游戏记录

# === 版本 ===
GET    /api/version/check           # 检查更新
GET    /api/version/changelog       # 更新日志

# === 健康 ===
GET    /api/health                  # 健康检查
```

## 七、高并发设计

| 策略 | 实现 |
|------|------|
| **连接池** | pgxpool (PG) + go-redis pool，最大连接数可配置 |
| **限流** | Redis令牌桶，全局 + 用户级，AI接口单独限流 |
| **缓存** | 题库/五十音/语法等静态数据Redis缓存，TTL 1小时 |
| **SSE流式** | AI对话用SSE推送，避免长连接占用 |
| **无状态** | JWT无状态认证，支持水平扩展 |
| **异步** | 邮件发送、AI出题等耗时操作异步化（Go channel） |
| **静态资源** | CDN/Nginx直接服务，不经过Go |
| **Gzip** | Gin中间件压缩响应 |

## 八、开发阶段规划

### Phase 1 - 基础骨架（2周）
- [x] 项目初始化：Turborepo + pnpm workspace
- [ ] Go后端骨架：Gin + GORM + PostgreSQL + Redis
- [ ] 认证系统：JWT + OAuth2 (Google/GitHub/LinuxDo) + 邮箱验证
- [ ] Web前端骨架：Next.js + Tailwind + shadcn/ui + 暗色主题 + i18n
- [ ] Docker Compose 部署脚本

### Phase 2 - 核心学习（2周）
- [ ] 五十音图模块（交互表格 + 发音 + 测验）
- [ ] TTS集成（Web Speech API）
- [ ] 词汇学习（卡片 + SRS间隔重复）
- [ ] 语法学习（课程 + 练习）
- [ ] 基础题库数据准备

### Phase 3 - 打字与AI（2周）
- [ ] 打字练习模块（金山打字通模式）
- [ ] AI对话集成（SSE流式 + 自定义模型配置）
- [ ] AI智能出题
- [ ] 错题本

### Phase 4 - 游戏与多端（2周）
- [ ] 打字竞速小游戏
- [ ] 推箱子语法游戏
- [ ] Tauri桌面端构建 + 自动更新
- [ ] Expo移动端适配

### Phase 5 - 打磨发布（1周）
- [ ] 版本更新系统
- [ ] GitHub Actions CI/CD
- [ ] 性能优化 + 安全加固
- [ ] 最终测试 + 部署

## 九、关键决策记录

1. **TTS选型**: Web Speech API（零延迟零成本） > Edge TTS（备选）
2. **状态管理**: Zustand（轻量，三端通用）
3. **ORM**: GORM（Go生态最成熟）
4. **临时邮箱拦截**: 维护黑名单域名列表（~3000个常见临时邮箱域名）
5. **SRS算法**: SM-2（Anki同款，经过验证的间隔重复算法）
6. **LinuxDo OAuth2**: 标准OAuth2 Authorization Code流程，端点已确认
7. **桌面更新**: Tauri内置updater，更新源为GitHub Releases
8. **移动端更新**: 日常热更新优先使用 EAS Update，原生变更走商店 / TestFlight
9. **服务端部署**: GitHub Actions 构建镜像推送到 GHCR，并自动 SSH 到云端执行更新脚本
10. **AI接口**: 统一走OpenAI兼容协议，支持任意模型服务商
11. **题库组织**: 采用 manifest + packs 注册式结构，降低后续维护成本
12. **游戏系统**: 采用统一 gameId + 配置式扩展方式，避免每个游戏单独长歪
