# 开发环境搭建指南

## 一、环境要求

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | >= 20 LTS | 前端运行时 |
| pnpm | >= 9.0 | 包管理器 |
| Go | >= 1.22 | 后端语言 |
| PostgreSQL | >= 16 | 数据库 |
| Redis | >= 7 | 缓存 |
| Docker | >= 24 | 容器化部署 |
| Docker Compose | >= 2.20 | 编排 |
| Git | >= 2.40 | 版本控制 |
| Rust | >= 1.75 | Tauri桌面端构建 |

## 二、安装步骤

### 2.1 克隆项目

```bash
git clone https://github.com/your-username/jp-study.git
cd jp-study
```

### 2.2 安装前端依赖

```bash
# 安装pnpm (如未安装)
npm install -g pnpm

# 安装所有workspace依赖
pnpm install
```

### 2.3 安装Go依赖

```bash
cd server
go mod download
cd ..
```

### 2.4 启动基础服务 (Docker)

```bash
# 启动PostgreSQL + Redis
docker compose -f docker/docker-compose.dev.yml up -d
```

**docker-compose.dev.yml:**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: nihongo
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pg_dev_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes

volumes:
  pg_dev_data:
```

### 2.5 配置环境变量

```bash
# 后端配置
cp server/config.example.yaml server/config.yaml
# 编辑 config.yaml 填入你的配置

# 前端配置
cp apps/web/.env.example apps/web/.env.local
# 编辑 .env.local
```

**server/config.example.yaml:**
```yaml
server:
  port: 8080
  host: "0.0.0.0"
  mode: "debug"   # debug / release

database:
  host: "localhost"
  port: 5432
  name: "nihongo"
  user: "postgres"
  password: "postgres"
  ssl_mode: "disable"
  max_open_conns: 50
  max_idle_conns: 10

redis:
  host: "localhost"
  port: 6379
  password: ""
  db: 0

jwt:
  secret: "dev-secret-change-in-production"
  access_ttl: "15m"
  refresh_ttl: "168h"    # 7天

oauth2:
  google:
    client_id: ""
    client_secret: ""
    redirect_url: "http://localhost:8080/api/auth/callback/google"
  github:
    client_id: ""
    client_secret: ""
    redirect_url: "http://localhost:8080/api/auth/callback/github"
  linuxdo:
    client_id: ""
    client_secret: ""
    redirect_url: "http://localhost:8080/api/auth/callback/linuxdo"
    auth_url: "https://connect.linux.do/oauth2/authorize"
    token_url: "https://connect.linux.do/oauth2/token"
    userinfo_url: "https://connect.linux.do/api/user"

email:
  smtp_host: "smtp.gmail.com"
  smtp_port: 587
  username: ""
  password: ""
  from: "NihonGo <noreply@your-domain.com>"

ai:
  default_base_url: "https://api.openai.com/v1"
  default_api_key: ""
  default_model: "gpt-4o-mini"
  timeout: 60
  max_concurrent_per_user: 1
```

**apps/web/.env.example:**
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# OAuth回调
NEXT_PUBLIC_OAUTH_REDIRECT_URL=http://localhost:3000/auth/callback

# 应用信息
NEXT_PUBLIC_APP_NAME=NihonGo
NEXT_PUBLIC_APP_VERSION=0.1.0
```

### 2.6 启动开发服务器

```bash
# 终端1: 启动Go后端
cd server
go run cmd/server/main.go

# 终端2: 启动Web前端
pnpm dev --filter web

# 终端3: (可选) 启动Mobile
pnpm dev --filter mobile
```

或使用 Turborepo 同时启动:

```bash
# 根目录下
pnpm dev
```

**turbo.json 开发任务:**
```json
{
    "tasks": {
        "dev": {
            "cache": false,
            "persistent": true
        },
        "build": {
            "dependsOn": ["^build"],
            "outputs": [".next/**", "dist/**"]
        },
        "lint": {},
        "typecheck": {}
    }
}
```

## 三、开发端口

| 服务 | 端口 | 说明 |
|------|------|------|
| Web (Next.js) | 3000 | 前端开发服务器 |
| Go API | 8080 | 后端API |
| PostgreSQL | 5432 | 数据库 |
| Redis | 6379 | 缓存 |
| Expo | 8081 | 移动端开发 |

## 四、开发工具推荐

### 4.1 VS Code 插件

```json
{
    "recommendations": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "golang.go",
        "ms-azuretools.vscode-docker",
        "prisma.prisma",
        "unifiedjs.vscode-mdx"
    ]
}
```

### 4.2 浏览器插件
- React DevTools
- Redux DevTools (Zustand兼容)
- Tailwind CSS IntelliSense

### 4.3 数据库管理
- pgAdmin 4 (Web界面)
- DBeaver (桌面客户端)
- Redis Insight (Redis可视化)

## 五、常用开发命令

```bash
# === 前端 ===
pnpm dev                    # 启动所有前端开发服务
pnpm dev --filter web       # 只启动Web
pnpm build                  # 构建所有
pnpm lint                   # ESLint检查
pnpm typecheck              # TypeScript类型检查
pnpm test                   # 运行测试

# === 后端 ===
cd server
go run cmd/server/main.go   # 启动开发服务器
go test ./...               # 运行所有测试
go build -o bin/server cmd/server/main.go  # 编译

# === Docker ===
docker compose -f docker/docker-compose.dev.yml up -d    # 启动数据库
docker compose -f docker/docker-compose.dev.yml down      # 停止
docker compose -f docker/docker-compose.dev.yml logs -f   # 查看日志

# === 桌面端 ===
cd apps/desktop
pnpm tauri dev              # Tauri开发模式
pnpm tauri build            # 构建MSI/EXE

# === 移动端 ===
cd apps/mobile
npx expo start              # 启动Expo
npx expo run:android        # Android模拟器
npx expo run:ios            # iOS模拟器 (需Mac)
```

## 六、Git工作流

### 6.1 分支规范

```
main            → 生产分支，保护分支
develop         → 开发主分支
feature/*       → 功能分支 (如 feature/kana-chart)
fix/*           → 修复分支 (如 fix/tts-not-working)
release/*       → 发布分支 (如 release/1.0.0)
```

### 6.2 Commit规范

```
feat: 新功能
fix: 修复
docs: 文档
style: 格式
refactor: 重构
test: 测试
chore: 杂务
perf: 性能优化
```

示例:
```
feat(learn): 添加五十音图交互表格
fix(tts): 修复Chrome下日语语音不可用
docs(api): 更新AI接口文档
```

## 七、故障排除

### 7.1 PostgreSQL连接失败
```bash
# 检查Docker容器状态
docker ps
# 检查端口占用
netstat -tlnp | grep 5432
# 重启数据库
docker compose -f docker/docker-compose.dev.yml restart postgres
```

### 7.2 Redis连接失败
```bash
redis-cli ping  # 应返回PONG
```

### 7.3 pnpm install 失败
```bash
pnpm store prune  # 清理缓存
rm -rf node_modules
pnpm install
```

### 7.4 Go mod download 慢
```bash
# 设置Go代理 (国内)
go env -w GOPROXY=https://goproxy.cn,direct
```

### 7.5 Tauri 构建失败
```bash
# 确认Rust已安装
rustc --version
# 更新Rust
rustup update
# 安装Tauri CLI
cargo install tauri-cli
```
