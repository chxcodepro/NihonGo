# 部署指南

## 一、部署架构

```
互联网
  │
  ▼
┌─────────────┐
│ NPM 网关    │ :80/:443 (SSL终止 + 反向代理)
│   :81 面板  │
└──────┬──────┘
       │
  ┌────┴────┐
  │         │
  ▼         ▼
┌─────┐  ┌──────┐
│ Web │  │ API  │
│:3000│  │:8080 │
└─────┘  └──┬───┘
             │
       ┌─────┴─────┐
       │           │
       ▼           ▼
    ┌──────┐   ┌───────┐
    │  PG  │   │ Redis │
    │:5432 │   │:6379  │
    └──────┘   └───────┘
```

## 二、Docker Compose 生产部署

### 2.1 docker-compose.yml

```yaml
version: '3.8'

services:
  # === Next.js Web ===
  web:
    image: ghcr.io/your-org/jp-study-web:latest
    environment:
      - NEXT_PUBLIC_API_URL=/api
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - frontend

  # === Go API Server ===
  server:
    image: ghcr.io/your-org/jp-study-server:latest
    environment:
      - GIN_MODE=release
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=nihongo
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
      - OAUTH2_GOOGLE_CLIENT_ID=${OAUTH2_GOOGLE_CLIENT_ID}
      - OAUTH2_GOOGLE_CLIENT_SECRET=${OAUTH2_GOOGLE_CLIENT_SECRET}
      - OAUTH2_GITHUB_CLIENT_ID=${OAUTH2_GITHUB_CLIENT_ID}
      - OAUTH2_GITHUB_CLIENT_SECRET=${OAUTH2_GITHUB_CLIENT_SECRET}
      - OAUTH2_LINUXDO_CLIENT_ID=${OAUTH2_LINUXDO_CLIENT_ID}
      - OAUTH2_LINUXDO_CLIENT_SECRET=${OAUTH2_LINUXDO_CLIENT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USERNAME=${SMTP_USERNAME}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - AI_DEFAULT_BASE_URL=${AI_DEFAULT_BASE_URL}
      - AI_DEFAULT_API_KEY=${AI_DEFAULT_API_KEY}
      - AI_DEFAULT_MODEL=${AI_DEFAULT_MODEL}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - frontend
      - backend

  # === PostgreSQL ===
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: nihongo
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d nihongo"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - backend

  # === Redis ===
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - backend

volumes:
  pg_data:
  redis_data:

networks:
  frontend:
  backend:
```

> 说明：
> - 推荐把 **Nginx Proxy Manager 独立部署**，业务 compose 只保留 `web / server / postgres / redis`
> - 生产环境默认不在云端本地构建镜像，而是直接拉取 GitHub Actions 推送到 GHCR 的镜像

### 2.2 .env 文件 (生产)

```bash
# 数据库
DB_USER=nihongo
DB_PASSWORD=<strong-random-password>

# Redis
REDIS_PASSWORD=<strong-random-password>

# JWT
JWT_SECRET=<64-char-random-string>

# OAuth2 - Google
OAUTH2_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
OAUTH2_GOOGLE_CLIENT_SECRET=xxx

# OAuth2 - GitHub
OAUTH2_GITHUB_CLIENT_ID=xxx
OAUTH2_GITHUB_CLIENT_SECRET=xxx

# OAuth2 - LinuxDo
OAUTH2_LINUXDO_CLIENT_ID=xxx
OAUTH2_LINUXDO_CLIENT_SECRET=xxx

# 邮件
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=noreply@your-domain.com
SMTP_PASSWORD=xxx

# AI
AI_DEFAULT_BASE_URL=https://api.openai.com/v1
AI_DEFAULT_API_KEY=sk-xxx
AI_DEFAULT_MODEL=gpt-4o-mini
```

## 三、Dockerfile

### 3.1 Go后端

```dockerfile
# docker/Dockerfile.server
# === 构建阶段 ===
FROM golang:1.22-alpine AS builder

WORKDIR /app

# 依赖缓存
COPY server/go.mod server/go.sum ./
RUN go mod download

# 复制源码并编译
COPY server/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/server cmd/server/main.go

# === 运行阶段 ===
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /bin/server .
COPY server/config.yaml ./config.yaml
COPY server/data/ ./data/
COPY server/migrations/ ./migrations/

EXPOSE 8080

CMD ["./server"]
```

### 3.2 Web前端

```dockerfile
# docker/Dockerfile.web
# === 依赖阶段 ===
FROM node:20-alpine AS deps

WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/question-bank/package.json ./packages/question-bank/

RUN pnpm install --frozen-lockfile

# === 构建阶段 ===
FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .

RUN pnpm build --filter web

# === 运行阶段 ===
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
```

## 四、Nginx Proxy Manager 配置

推荐在 NPM 中配置下面两类代理规则：

1. `your-domain.com` → `web:3000`
2. `your-domain.com/api` → `server:8080`

建议在 NPM 中开启：

- 自动 HTTPS
- Force SSL
- WebSocket Support
- 基础安全头

如果 NPM 和业务服务不在同一个 compose 中，需要保证：

- 两边网络互通
- 或者用内网 IP / 内网域名转发
- `/api` 路径能正确指向 `server:8080`

## 五、自动部署与更新脚本

```bash
#!/bin/bash
# scripts/update-prod.sh

set -e

echo "=== NihonGo 自动更新脚本 ==="

echo ">>> 拉取最新镜像..."
docker compose pull web server

echo ">>> 启动新版本..."
docker compose up -d web server

# 等待健康检查
echo ">>> 等待服务启动..."
sleep 10

# 检查服务状态
echo ">>> 检查服务状态..."
docker compose ps
curl -f http://localhost:8080/api/health

echo "=== 更新完成 ==="
```

推荐由 GitHub Actions 在镜像推送成功后，通过 SSH 自动执行这个脚本。

## 六、HTTPS 与证书

推荐直接由 **Nginx Proxy Manager** 管理 Let's Encrypt 证书和自动续期。

重点检查：

- 域名已解析到 NPM
- 80 / 443 端口已开放
- NPM 中已为站点启用 SSL
- 自动续期任务正常

## 七、监控 & 日志

### 7.1 查看日志

```bash
# 所有服务
docker compose logs -f

# 单个服务
docker compose logs -f server
docker compose logs -f web

# 最近100行
docker compose logs --tail=100 server
```

### 7.2 数据库备份

```bash
# 备份
docker compose exec postgres pg_dump -U nihongo nihongo > backup_$(date +%Y%m%d).sql

# 恢复
docker compose exec -T postgres psql -U nihongo nihongo < backup_20240115.sql
```

### 7.3 资源监控

```bash
# 容器资源使用
docker stats

# 磁盘空间
docker system df
```

## 八、CI/CD (GitHub Actions)

### 8.1 服务端镜像自动部署

```yaml
# .github/workflows/deploy-server.yml
name: Deploy Server Stack

on:
  push:
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push web image
        run: |
          docker build -f docker/Dockerfile.web -t ghcr.io/your-org/jp-study-web:${{ github.ref_name }} .
          docker tag ghcr.io/your-org/jp-study-web:${{ github.ref_name }} ghcr.io/your-org/jp-study-web:latest
          docker push ghcr.io/your-org/jp-study-web:${{ github.ref_name }}
          docker push ghcr.io/your-org/jp-study-web:latest

      - name: Build and push server image
        run: |
          docker build -f docker/Dockerfile.server -t ghcr.io/your-org/jp-study-server:${{ github.ref_name }} .
          docker tag ghcr.io/your-org/jp-study-server:${{ github.ref_name }} ghcr.io/your-org/jp-study-server:latest
          docker push ghcr.io/your-org/jp-study-server:${{ github.ref_name }}
          docker push ghcr.io/your-org/jp-study-server:latest

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/nihongo
            ./scripts/update-prod.sh
```

### 8.2 桌面端构建

```yaml
# .github/workflows/desktop-build.yml
name: Build Desktop

on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        platform: [windows-latest, ubuntu-22.04, macos-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install deps and build
        run: |
          pnpm install
          pnpm build --filter web
          cd apps/desktop
          pnpm tauri build

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: nihongo-desktop-${{ matrix.platform }}
          path: apps/desktop/src-tauri/target/release/bundle/**

      - name: Create Release
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: apps/desktop/src-tauri/target/release/bundle/**
```

### 8.3 移动端构建与热更新

推荐使用 GitHub Actions + Expo EAS：

- Android：构建 AAB / APK
- iOS：构建并分发到 TestFlight
- 日常热更新：使用 EAS Update 应用内拉取

## 九、服务器要求

### 最低配置 (4H6G)

| 服务 | CPU | 内存 | 磁盘 |
|------|-----|------|------|
| NPM | 共享 | 200MB | 1GB |
| Next.js | 1核 | 512MB | 500MB |
| Go API | 1核 | 256MB | 50MB |
| PostgreSQL | 1核 | 1GB | 10GB |
| Redis | 共享 | 256MB | 1GB |
| 系统 | 1核 | ~4GB | - |
| **合计** | 4核 | ~6GB | ~12GB |

### 性能预估
- 并发连接数: 3000-5000
- API QPS: 2000-3000
- AI并发: 受限于上游API (非后端瓶颈)
- 数据库连接池: 50

## 十、环境差异说明

### 10.1 开发环境

特点：

- 允许本地热重载
- 允许使用测试密钥和测试数据
- 日志级别可更详细
- 可使用 `docker-compose.dev.yml`

建议：

- 不暴露公网
- 不使用真实生产账号和真实生产数据
- AI、邮件、OAuth 可按需使用测试配置或 mock

### 10.2 测试 / 预发布环境

特点：

- 配置尽量接近生产
- 用于联调、回归、发布前验收
- 要能跑数据库迁移和回滚验证

建议：

- 独立数据库和 Redis
- 独立域名或子域名
- 开启基础监控和告警
- 保留最小可回放的测试数据

### 10.3 生产环境

特点：

- 只运行发布版构建产物
- 使用正式域名、正式密钥和正式依赖
- 默认开启 HTTPS、备份、监控和告警

必须保证：

- Debug 模式关闭
- 密钥全部从环境变量注入
- 备份可恢复
- 日志可追踪

## 十一、回滚与恢复

### 11.1 回滚触发场景

建议在下面情况优先考虑回滚：

- 登录主链路异常
- 学习进度保存异常
- AI 对话大面积失败
- 关键接口错误率明显上升
- 数据迁移后出现兼容性问题

### 11.2 应用回滚步骤

建议回滚步骤：

1. 确认当前故障影响范围
2. 暂停继续发布和自动化变更
3. 切回上一个稳定镜像或稳定提交
4. 重启受影响服务
5. 验证健康检查
6. 验证核心链路：登录、学习保存、AI 对话、版本检查
7. 记录回滚原因和影响时间段

### 11.3 数据库回滚注意点

数据库回滚不能简单等同于代码回滚，必须确认：

- 本次迁移是否包含破坏性变更
- 是否新增了不可逆字段调整
- 是否需要先做数据备份
- 是否需要写专门的 down migration

建议原则：

- 生产环境禁止没有回滚方案的破坏性迁移直接上线
- 对高风险迁移先在预发布环境演练

### 11.4 备份恢复演练建议

建议至少定期演练下面几项：

- 从备份恢复 PostgreSQL
- 恢复 Redis 持久化数据或重建缓存
- 使用上一个稳定镜像恢复应用
- 验证恢复后核心功能可用

## 十二、备份与恢复细化

### 12.1 建议备份范围

- PostgreSQL 全量备份
- 关键配置文件备份
- NPM 配置备份
- 发布版本记录
- 如有本地上传文件，则补充对象存储或文件备份

### 12.2 恢复优先级建议

故障恢复时建议优先级：

1. 服务恢复可访问
2. 数据库恢复可用
3. 登录和核心学习链路恢复
4. AI、游戏、版本等扩展功能恢复
5. 后续再处理统计类和低优先级能力

## 十三、告警阈值建议

### 13.1 服务层

- 健康检查连续失败 3 次报警
- 容器频繁重启报警
- API 5xx 错误率持续升高报警

### 13.2 资源层

- CPU 长时间超过阈值报警
- 内存持续高位报警
- 磁盘空间低于安全水位报警
- Redis 内存接近上限报警

### 13.3 业务层

- 登录失败率异常升高
- 学习进度保存失败明显增加
- AI 对话超时或失败明显增加
- 版本检查接口异常升高

## 十四、部署后检查清单

- [ ] 容器全部正常启动
- [ ] `/api/health` 返回正常
- [ ] Web 首页可访问
- [ ] 登录主链路正常
- [ ] 学习内容可加载
- [ ] 学习进度可保存
- [ ] AI 对话可正常建立
- [ ] NPM 反向代理和 HTTPS 正常
- [ ] 日志可正常输出
- [ ] 基础监控和告警正常
