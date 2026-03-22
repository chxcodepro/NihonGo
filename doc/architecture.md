# 架构设计文档

## 一、系统架构总览

```
┌─────────────────────────────────────────────────────────┐
│                      客户端层                            │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Web      │  │ Desktop      │  │ Mobile            │  │
│  │ Next.js  │  │ Tauri v2     │  │ Expo/React Native │  │
│  │ :3000    │  │ (套Web产物)   │  │                   │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬──────────┘  │
│       │               │                   │              │
│       └───────────────┼───────────────────┘              │
│                       │ HTTPS                            │
└───────────────────────┼──────────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────────┐
│          网关层 Nginx Proxy Manager                         │
│             反向代理 + HTTPS + 域名管理                     │
│              :80 / :443                                   │
└───────────────────────┼──────────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────────┐
│                   服务层 Go                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                  Gin HTTP Server :8080               │ │
│  │  ┌──────┐ ┌──────┐ ┌─────┐ ┌──────┐ ┌───────────┐ │ │
│  │  │Auth  │ │Learn │ │AI   │ │Game  │ │Version    │ │ │
│  │  │认证   │ │学习   │ │对话  │ │游戏  │ │版本更新    │ │ │
│  │  └──┬───┘ └──┬───┘ └──┬──┘ └──┬───┘ └─────┬─────┘ │ │
│  │     │        │        │       │            │        │ │
│  │  ┌──┴────────┴────────┴───────┴────────────┴─────┐  │ │
│  │  │            Service Layer (业务逻辑)             │  │ │
│  │  └──┬────────┬────────┬───────┬────────────┬─────┘  │ │
│  │     │        │        │       │            │        │ │
│  │  ┌──┴────────┴────────┴───────┴────────────┴─────┐  │ │
│  │  │           Repository Layer (数据访问)           │  │ │
│  │  └───────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────┬──────────────────┬────────────────────────────┘
           │                  │
┌──────────┴───────┐  ┌──────┴──────────┐
│ PostgreSQL 16    │  │ Redis 7         │
│ :5432            │  │ :6379           │
│ 用户/题库/记录    │  │ 缓存/Session/限流│
└──────────────────┘  └─────────────────┘
```

## 二、前端架构

### 2.1 Monorepo 结构 (Turborepo + pnpm)

```
apps/
├── web/        → Next.js 15 (App Router, RSC)
├── mobile/     → Expo SDK 52 (Expo Router)
└── desktop/    → Tauri v2 (复用web构建产物)

packages/
├── ui/         → 共享组件库 (shadcn/ui封装)
├── shared/     → 类型/工具/Hooks/Store/API Client
├── i18n/       → 多语言资源
└── question-bank/ → 题库与游戏内容仓库（manifest + packs）
```

### 2.2 状态管理

```
Zustand (轻量级状态管理)
├── authStore      → 用户认证状态
├── settingsStore  → 主题/语言/AI配置
├── learnStore     → 学习进度/当前模块
├── typingStore    → 打字练习状态
└── gameStore      → 统一游戏状态（按 gameId 管理）

数据持久化:
├── Web       → localStorage / IndexedDB
├── Mobile    → AsyncStorage
└── Desktop   → Tauri fs plugin
```

### 2.3 路由结构 (Web)

```
app/
├── page.tsx                # 首页/着陆页
├── login/                  # 登录
├── register/               # 注册
├── callback/               # OAuth回调
├── learn/
│   ├── kana/               # 五十音
│   ├── vocabulary/         # 词汇
│   ├── grammar/            # 语法
│   └── typing/             # 打字练习
├── game/
│   ├── typing-race/        # 打字竞速
│   └── sokoban/            # 推箱子
├── settings/               # 设置（不登录也可改主题/语言）
├── ai-chat/                # AI对话
├── profile/                # 个人中心
└── api/                    # BFF (如需)
```

### 2.4 组件分层

```
packages/ui/           → 原子组件 (Button, Input, Card, Modal, Toast...)
apps/web/components/   → Web专用组件 (Navbar, Sidebar, PageLayout...)
apps/web/app/**/       → 页面组件 (与路由绑定)

组件设计原则:
1. 共享组件放 packages/ui，平台专用组件放对应 apps/
2. shadcn/ui 作为基础，按需定制
3. Framer Motion 统一动效规范
4. 所有组件支持 dark mode (通过 Tailwind dark: 前缀)
```

### 2.5 题库与游戏内容组织

推荐采用注册式结构：

```text
packages/question-bank/
├── manifest.json
├── modules/
│   ├── kana/
│   ├── vocabulary/
│   ├── grammar/
│   ├── typing/
│   └── quizzes/
└── games/
    ├── sokoban/
    └── typing-race/
```

设计重点：

1. 学习内容按模块和 pack 拆分
2. 游戏内容也挂在统一内容仓库下
3. 通过 manifest 做注册和索引
4. 前后端优先依赖 manifest，而不是硬编码具体文件路径

## 三、后端架构

### 3.1 分层架构

```
Handler (HTTP处理层)
    ↓ 解析请求、参数校验、返回响应
Service (业务逻辑层)
    ↓ 核心逻辑、事务管理、权限判断
Repository (数据访问层)
    ↓ GORM操作、SQL查询、缓存读写
Model (数据模型层)
    → GORM模型定义、数据结构

横切关注点 (Middleware):
├── JWT认证中间件
├── CORS跨域中间件
├── 限流中间件 (Redis令牌桶)
├── 日志中间件 (结构化日志)
├── 错误恢复中间件
└── 请求ID追踪中间件
```

### 3.2 Go项目结构

```
server/
├── cmd/server/main.go           # 入口：初始化配置→连接DB→注册路由→启动
├── internal/
│   ├── config/config.go         # Viper配置管理
│   ├── middleware/
│   │   ├── auth.go              # JWT校验
│   │   ├── cors.go              # CORS
│   │   ├── ratelimit.go         # 限流
│   │   └── logger.go            # 请求日志
│   ├── handler/                 # 按模块拆分handler
│   ├── service/                 # 按模块拆分service
│   ├── repository/              # 按模块拆分repo
│   ├── model/                   # GORM模型
│   └── pkg/                     # 内部工具包
│       ├── oauth/               # OAuth2客户端封装
│       ├── email/               # SMTP邮件
│       ├── ai/                  # AI代理 (OpenAI兼容)
│       ├── jwt/                 # JWT生成/验证
│       ├── disposable/          # 临时邮箱检测
│       └── response/            # 统一响应格式
├── migrations/                  # SQL迁移文件
└── config.yaml                  # 配置文件模板
```

### 3.3 请求处理流程

```
HTTP Request
    → Nginx Proxy Manager (HTTPS、域名、反向代理)
    → Gin Router (路由匹配)
    → Middleware Chain (CORS → Logger → RateLimit → Auth)
    → Handler (参数解析、调用Service)
    → Service (业务逻辑)
    → Repository (数据操作)
    → Response (统一JSON格式)
```

### 3.4 AI代理架构

```
客户端                    Go后端                     AI服务商
  │                        │                          │
  │  POST /api/ai/chat     │                          │
  │ ──────────────────────→ │                          │
  │                        │  转发请求(替换apiKey)      │
  │                        │ ────────────────────────→ │
  │                        │                          │
  │                        │  SSE Stream Response      │
  │  SSE Stream            │ ←──────────────────────── │
  │ ←────────────────────── │                          │
  │                        │                          │

要点:
1. 后端作为代理，不暴露apiKey给前端
2. 支持用户自定义baseURL+apiKey（加密存储在DB）
3. 内置默认配置供未自定义的用户使用
4. SSE逐token推送，前端打字机效果展示
5. 超时控制：单次请求最长60秒
6. 并发限制：每用户同时1个AI请求
```

## 四、认证架构

### 4.1 JWT Token 流程

```
Access Token (15min)  ←→  API请求携带
Refresh Token (7天)   ←→  刷新Access Token

存储:
├── Web: httpOnly cookie (Refresh) + memory (Access)
├── Mobile: SecureStore (两者都存)
└── Desktop: Tauri secure store

刷新流程:
1. Access Token过期 → 前端拦截401
2. 用Refresh Token调 /api/auth/refresh
3. 返回新的Access Token + 新的Refresh Token (旋转)
4. 旧Refresh Token失效（Redis黑名单）
```

### 4.2 OAuth2 流程

```
用户点击"Google登录"
    → 前端跳转 /api/auth/oauth/google
    → 后端重定向到Google授权页
    → 用户授权
    → Google回调 /api/auth/callback/google?code=xxx
    → 后端用code换token，获取用户信息
    → 查找/创建本地用户
    → 签发JWT
    → 重定向回前端 + token
```

### 4.3 无登录策略

```
未登录用户:
├── 所有学习功能可用（数据存本地）
├── 所有游戏可用
├── TTS可用
├── 题库可用
└── 不可用: AI对话（需登录验证apiKey归属）

登录后:
├── 本地数据同步到云端
├── 多端同步
├── AI对话解锁
└── 学习进度云端保存
```

## 五、数据流

### 5.1 学习数据同步

```
本地 (Zustand + 持久化)
    │
    │ 登录后触发同步
    ↓
云端 (PostgreSQL)
    │
    │ 冲突策略: Last Write Wins (以时间戳为准)
    ↓
其他端拉取最新数据
```

### 5.2 TTS 数据流

```
用户点击发音按钮
    → 检查浏览器 speechSynthesis.getVoices()
    → 筛选 lang === 'ja-JP' 的语音
    → new SpeechSynthesisUtterance(text)
    → utterance.voice = jaVoice
    → utterance.rate = 0.9 (稍慢，适合学习)
    → speechSynthesis.speak(utterance)
    → 即时出声，零网络延迟
```

### 5.3 题库与游戏扩展流

```text
新增模块 / 新增游戏
    → 注册到 manifest
    → 增加 pack 或 level-pack
    → 跑结构校验
    → 前后端按 gameId / module 读取
```

这样做的好处是：

- 新增内容不用总改大文件
- 新增游戏不用复制一整套命名体系
- 数据校验、导出、缓存和版本管理更统一

## 六、部署架构

### 6.1 云端部署结构

```yaml
services:
  npm:        # 建议独立部署的 Nginx Proxy Manager
    ports: [80, 81, 443]
  web:        # Next.js SSR
    ports: [3000]
  server:     # Go API
    ports: [8080]
  postgres:   # 数据库
    ports: [5432]
    volumes: [pg_data]
  redis:      # 缓存
    ports: [6379]
```

### 6.2 网络拓扑

```
外网 → NPM(:80/:443)
        ├── /           → web(:3000)      # Next.js页面
        ├── /api/*      → server(:8080)   # Go API
        └── /_next/*    → web(:3000)      # Next.js静态资源

内网:
  server → postgres(:5432)
  server → redis(:6379)

发布链路:
  GitHub Actions
    → 构建 web / server 镜像
    → 推送到 GHCR
    → SSH 到云端执行更新脚本
    → docker compose pull && docker compose up -d
```

## 七、技术选型依据

| 选型 | 备选方案 | 选择理由 |
|------|---------|---------|
| Next.js 15 | Remix, Nuxt | React生态最大，shadcn/ui生态，App Router + RSC性能好 |
| Tailwind CSS 4 | CSS Modules, styled-components | 原子化CSS，暗色主题一行搞定，三端可共享 |
| shadcn/ui | Ant Design, MUI | 可定制性最强，不增加bundle size，复制代码而非依赖 |
| Framer Motion | GSAP, react-spring | React集成最好，API直观，支持手势 |
| Zustand | Redux, Jotai | 极简API，无boilerplate，体积小，支持持久化 |
| Gin | Echo, Fiber, Chi | Go Web框架最成熟，性能最好，中间件生态丰富 |
| GORM | sqlx, ent | Go ORM最成熟，自动迁移，关系映射方便 |
| Tauri v2 | Electron | 体积5MB vs 150MB，内存占用低，安全性高 |
| Expo SDK 52 | bare RN | 开箱即用，EAS构建云服务，OTA更新 |
| Turborepo | Nx, Lerna | 配置简单，增量构建，pnpm原生支持 |
