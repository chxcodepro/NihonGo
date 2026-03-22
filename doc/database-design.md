# 数据库设计文档

## 一、概述

- **数据库**: PostgreSQL 16
- **ORM**: GORM (Go)
- **缓存**: Redis 7
- **字符集**: UTF-8 (支持中日韩字符)
- **时区**: 所有时间字段使用 TIMESTAMPTZ (UTC存储)

## 二、ER关系图

```
users ─────────┬──── learning_progress
               │
               ├──── typing_records
               │
               ├──── ai_conversations
               │
               ├──── game_records
               │
               ├──── user_oauth_links
               │
               └──── user_settings

app_versions (独立表，无外键)

question_banks (静态题库，JSON文件为主，DB为辅)
```

## 三、表结构详细设计

### 3.1 users - 用户表

```sql
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE,          -- 可空(纯OAuth用户)
    password_hash   VARCHAR(255),                 -- bcrypt哈希，OAuth用户为空
    username        VARCHAR(100) NOT NULL,
    avatar_url      TEXT DEFAULT '',
    email_verified  BOOLEAN DEFAULT FALSE,
    locale          VARCHAR(10) DEFAULT 'zh-CN',  -- 用户语言偏好
    theme           VARCHAR(10) DEFAULT 'system',  -- light/dark/system
    status          SMALLINT DEFAULT 1,           -- 1=活跃 2=禁用 3=注销
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_status ON users(status);
```

**GORM模型:**
```go
type User struct {
    ID            int64          `gorm:"primaryKey;autoIncrement"`
    Email         *string        `gorm:"size:255;uniqueIndex"`
    PasswordHash  string         `gorm:"size:255"`
    Username      string         `gorm:"size:100;not null"`
    AvatarURL     string         `gorm:"type:text;default:''"`
    EmailVerified bool           `gorm:"default:false"`
    Locale        string         `gorm:"size:10;default:'zh-CN'"`
    Theme         string         `gorm:"size:10;default:'system'"`
    Status        int16          `gorm:"default:1"`
    LastLoginAt   *time.Time
    CreatedAt     time.Time
    UpdatedAt     time.Time

    // 关联
    OAuthLinks       []UserOAuthLink       `gorm:"foreignKey:UserID"`
    Settings         *UserSettings         `gorm:"foreignKey:UserID"`
    LearningProgress []LearningProgress    `gorm:"foreignKey:UserID"`
    TypingRecords    []TypingRecord        `gorm:"foreignKey:UserID"`
    AIConversations  []AIConversation      `gorm:"foreignKey:UserID"`
    GameRecords      []GameRecord          `gorm:"foreignKey:UserID"`
}
```

### 3.2 user_oauth_links - OAuth关联表

```sql
CREATE TABLE user_oauth_links (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider        VARCHAR(50) NOT NULL,         -- google/github/linuxdo
    provider_id     VARCHAR(255) NOT NULL,        -- 第三方平台用户ID
    provider_email  VARCHAR(255),                 -- 第三方平台邮箱
    provider_name   VARCHAR(255),                 -- 第三方平台昵称
    provider_avatar TEXT,                         -- 第三方平台头像
    access_token    TEXT,                         -- 加密存储
    refresh_token   TEXT,                         -- 加密存储
    token_expires   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(provider, provider_id)
);

CREATE INDEX idx_oauth_user_id ON user_oauth_links(user_id);
CREATE INDEX idx_oauth_provider ON user_oauth_links(provider, provider_id);
```

### 3.3 user_settings - 用户设置表

```sql
CREATE TABLE user_settings (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    ai_base_url     TEXT DEFAULT '',               -- 自定义AI接口地址
    ai_api_key      TEXT DEFAULT '',               -- AES加密存储
    ai_model        VARCHAR(100) DEFAULT '',       -- 自定义模型名
    tts_voice       VARCHAR(100) DEFAULT '',       -- 偏好TTS语音
    tts_rate        FLOAT DEFAULT 0.9,             -- TTS语速
    typing_layout   VARCHAR(20) DEFAULT 'romaji',  -- romaji/kana
    daily_goal      INT DEFAULT 20,                -- 每日学习目标(分钟)
    notification    BOOLEAN DEFAULT TRUE,          -- 复习提醒
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.4 learning_progress - 学习进度表

```sql
CREATE TABLE learning_progress (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module          VARCHAR(50) NOT NULL,          -- hiragana/katakana/vocabulary/grammar
    item_id         VARCHAR(100) NOT NULL,         -- 知识点ID (如 "hiragana_a", "vocab_n5_001")
    level           INT DEFAULT 0,                 -- SRS等级 (0-8)
    ease_factor     FLOAT DEFAULT 2.5,             -- SM-2 难度因子
    interval_days   INT DEFAULT 0,                 -- 当前间隔天数
    next_review     TIMESTAMPTZ,                   -- 下次复习时间
    review_count    INT DEFAULT 0,                 -- 总复习次数
    correct_count   INT DEFAULT 0,                 -- 正确次数
    last_reviewed   TIMESTAMPTZ,                   -- 上次复习时间
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, module, item_id)
);

CREATE INDEX idx_progress_user_module ON learning_progress(user_id, module);
CREATE INDEX idx_progress_next_review ON learning_progress(user_id, next_review);
```

### 3.5 typing_records - 打字记录表

```sql
CREATE TABLE typing_records (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode            VARCHAR(50) NOT NULL,          -- romaji/kana/word/sentence
    difficulty      VARCHAR(20) NOT NULL,          -- beginner/intermediate/advanced
    content_id      VARCHAR(100),                  -- 练习内容ID
    wpm             FLOAT NOT NULL,                -- 每分钟字数
    accuracy        FLOAT NOT NULL,                -- 正确率 (0-1)
    total_chars     INT NOT NULL,                  -- 总字符数
    correct_chars   INT NOT NULL,                  -- 正确字符数
    duration_sec    INT NOT NULL,                  -- 用时(秒)
    error_chars     JSONB DEFAULT '[]',            -- 错误字符详情
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_typing_user ON typing_records(user_id, created_at DESC);
CREATE INDEX idx_typing_mode ON typing_records(user_id, mode);
```

### 3.6 ai_conversations - AI对话表

```sql
CREATE TABLE ai_conversations (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL DEFAULT '新对话',
    scenario        VARCHAR(100) DEFAULT 'free',   -- free/introduce/restaurant/direction/interview
    model_used      VARCHAR(100),                  -- 使用的模型名
    message_count   INT DEFAULT 0,
    messages        JSONB DEFAULT '[]',            -- [{role,content,timestamp}]
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conv_user ON ai_conversations(user_id, updated_at DESC);
```

**messages JSONB 格式:**
```json
[
    {
        "role": "system",
        "content": "你是日语老师...",
        "timestamp": "2024-01-01 08:00:00 UTC+8"
    },
    {
        "role": "user",
        "content": "こんにちは",
        "timestamp": "2024-01-01 08:01:00 UTC+8"
    },
    {
        "role": "assistant",
        "content": "こんにちは！...",
        "timestamp": "2024-01-01 08:01:05 UTC+8"
    }
]
```

### 3.7 game_records - 游戏记录表

```sql
CREATE TABLE game_records (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_type       VARCHAR(50) NOT NULL,          -- typing_race/sokoban
    difficulty      VARCHAR(20),                   -- easy/normal/hard
    level           INT DEFAULT 1,                 -- 关卡号(推箱子)
    score           INT DEFAULT 0,
    duration_sec    INT,                           -- 用时
    completed       BOOLEAN DEFAULT FALSE,         -- 是否通关
    metadata        JSONB DEFAULT '{}',            -- 游戏详情
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_game_user ON game_records(user_id, game_type, created_at DESC);
```

**metadata示例 - 打字竞速:**
```json
{
    "player_wpm": 85.5,
    "ai_wpm": 120,
    "player_accuracy": 0.95,
    "content_length": 200,
    "result": "lose"
}
```

**metadata示例 - 推箱子:**
```json
{
    "moves": 45,
    "min_moves": 30,
    "grammar_points": ["は", "が", "を"],
    "stars": 2
}
```

### 3.8 app_versions - 应用版本表

```sql
CREATE TABLE app_versions (
    id              SERIAL PRIMARY KEY,
    platform        VARCHAR(20) NOT NULL,          -- web/windows/macos/linux/android/ios
    version         VARCHAR(20) NOT NULL,          -- semver: 1.0.0
    version_code    INT NOT NULL,                  -- 数字版本号，用于比较
    download_url    TEXT,                          -- 下载地址
    changelog_zh    TEXT DEFAULT '',               -- 中文更新日志
    changelog_en    TEXT DEFAULT '',               -- 英文更新日志
    changelog_ja    TEXT DEFAULT '',               -- 日文更新日志
    min_version     VARCHAR(20),                   -- 最低兼容版本
    force_update    BOOLEAN DEFAULT FALSE,         -- 是否强制更新
    published       BOOLEAN DEFAULT FALSE,         -- 是否已发布
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_version_platform ON app_versions(platform, version);
CREATE INDEX idx_version_published ON app_versions(platform, published, version_code DESC);
```

### 3.9 email_verifications - 邮箱验证码表

```sql
CREATE TABLE email_verifications (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL,
    code            VARCHAR(6) NOT NULL,           -- 6位数字验证码
    purpose         VARCHAR(20) NOT NULL,          -- register/login/reset
    attempts        INT DEFAULT 0,                 -- 尝试次数(防暴力)
    max_attempts    INT DEFAULT 5,
    expires_at      TIMESTAMPTZ NOT NULL,          -- 过期时间(15分钟)
    used            BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_verify ON email_verifications(email, purpose, used);
```

### 3.10 disposable_email_domains - 临时邮箱黑名单

```sql
CREATE TABLE disposable_email_domains (
    id              SERIAL PRIMARY KEY,
    domain          VARCHAR(255) NOT NULL UNIQUE,   -- 如 tempmail.com
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

## 四、Redis 数据结构设计

### 4.1 Session / Token

```
# Refresh Token 白名单 (验证token有效性)
SET   refresh_token:{token_hash}  →  user_id   TTL: 7天

# Refresh Token 黑名单 (已失效的token)
SET   blacklist:rt:{token_hash}   →  1         TTL: 7天

# 用户活跃token计数 (限制同时登录设备数)
HASH  user_tokens:{user_id}  →  {device: token_hash}
```

### 4.2 限流

```
# 全局API限流 (令牌桶)
STRING  ratelimit:global:{ip}       →  count    TTL: 1秒
        规则: 100次/秒/IP

# 用户级限流
STRING  ratelimit:user:{user_id}    →  count    TTL: 1分钟
        规则: 200次/分钟/用户

# AI接口限流 (更严格)
STRING  ratelimit:ai:{user_id}      →  count    TTL: 1分钟
        规则: 10次/分钟/用户

# 邮箱验证码限流
STRING  ratelimit:email:{email}     →  count    TTL: 1小时
        规则: 5次/小时/邮箱

# 登录失败限流
STRING  ratelimit:login:{ip}        →  count    TTL: 15分钟
        规则: 10次/15分钟/IP
```

### 4.3 缓存

```
# 题库缓存 (避免频繁读JSON/DB)
HASH  cache:kana           →  {data}          TTL: 24小时
HASH  cache:vocab:{level}  →  {data}          TTL: 24小时
HASH  cache:grammar:{level} → {data}          TTL: 24小时

# 版本信息缓存
HASH  cache:version:{platform}  →  {data}     TTL: 1小时

# 临时邮箱域名缓存
SET   cache:disposable_domains  →  [domains]  TTL: 24小时
```

### 4.4 实时数据

```
# 在线用户数统计
HYPERLOGLOG  online:daily:{date}  →  user_ids

# 打字竞速房间 (如后续扩展多人)
HASH  game:typing_race:{session_id}  →  {state}  TTL: 30分钟
```

## 五、数据迁移策略

### 5.1 GORM AutoMigrate

```go
// 开发环境: 自动迁移
db.AutoMigrate(
    &model.User{},
    &model.UserOAuthLink{},
    &model.UserSettings{},
    &model.LearningProgress{},
    &model.TypingRecord{},
    &model.AIConversation{},
    &model.GameRecord{},
    &model.AppVersion{},
    &model.EmailVerification{},
    &model.DisposableEmailDomain{},
)
```

### 5.2 生产环境迁移

使用 `golang-migrate` 管理SQL迁移文件:

```
server/migrations/
├── 000001_init_users.up.sql
├── 000001_init_users.down.sql
├── 000002_init_learning.up.sql
├── 000002_init_learning.down.sql
├── ...
```

## 六、数据备份

```bash
# PostgreSQL 定时备份 (crontab)
0 3 * * * pg_dump -Fc nihongo > /backups/nihongo_$(date +%Y%m%d).dump

# 保留最近30天备份
find /backups -name "nihongo_*.dump" -mtime +30 -delete
```

## 七、性能优化

### 7.1 索引策略
- 所有外键字段建索引
- 查询频率高的组合建复合索引
- JSONB字段按需建GIN索引
- 定期 `ANALYZE` 更新统计信息

### 7.2 分区策略 (未来扩展)
- `typing_records`: 按月分区（数据量最大）
- `game_records`: 按月分区
- `ai_conversations`: 按月分区

### 7.3 连接池配置
```go
sqlDB.SetMaxOpenConns(50)        // 最大连接数
sqlDB.SetMaxIdleConns(10)        // 最大空闲连接
sqlDB.SetConnMaxLifetime(time.Hour)  // 连接最大生命周期
```

## 八、约束与删除策略

### 8.1 唯一约束清单

建议明确维护下面这些唯一约束，避免出现重复数据：

| 表 | 约束 | 作用 |
|----|------|------|
| `users` | `email` 唯一（非空时） | 避免重复邮箱 |
| `user_oauth_links` | `(provider, provider_id)` 唯一 | 避免同一第三方账号重复绑定 |
| `user_settings` | `user_id` 唯一 | 保证一个用户只有一份设置 |
| `learning_progress` | `(user_id, module, item_id)` 唯一 | 保证同一知识点只有一条学习进度 |
| `app_versions` | `(platform, version)` 唯一 | 避免同平台重复版本 |
| `disposable_email_domains` | `domain` 唯一 | 避免黑名单域名重复 |

### 8.2 重点联合索引清单

建议重点维护下面这些联合索引：

| 表 | 索引 | 用途 |
|----|------|------|
| `learning_progress` | `(user_id, module)` | 查询某用户某模块学习进度 |
| `learning_progress` | `(user_id, next_review)` | 查询待复习列表 |
| `typing_records` | `(user_id, created_at DESC)` | 查看打字历史 |
| `game_records` | `(user_id, game_type, created_at DESC)` | 查看游戏历史 |
| `ai_conversations` | `(user_id, updated_at DESC)` | 查看最近对话 |
| `email_verifications` | `(email, purpose, created_at DESC)` | 查询最近验证码 |

### 8.3 删除策略

各表删除策略建议如下：

| 表 | 删除策略 | 说明 |
|----|----------|------|
| `users` | 逻辑删除优先 | 注销后保留最小必要审计信息 |
| `user_oauth_links` | 物理删除 | 用户删除后级联删除 |
| `user_settings` | 物理删除 | 用户删除后级联删除 |
| `learning_progress` | 物理删除 | 用户删除后级联删除 |
| `typing_records` | 物理删除 | 用户删除后级联删除 |
| `ai_conversations` | 按策略清理 | 用户主动删除或过期清理 |
| `game_records` | 物理删除或归档 | 视统计需求决定 |
| `email_verifications` | 定期清理 | 过期后自动删除 |
| `disposable_email_domains` | 常驻保留 | 定期更新覆盖 |

建议原则：

1. 用户核心身份数据优先逻辑删除，便于风控和审计。
2. 派生型数据和短期临时数据优先物理删除。
3. 验证码、临时 token、限流记录这类临时数据必须有 TTL 或清理任务。

## 九、数据保留策略

### 9.1 保留周期建议

| 数据类型 | 建议保留周期 | 说明 |
|----------|--------------|------|
| 用户账户基础信息 | 长期保留 | 直到用户注销并完成清理流程 |
| 学习进度 | 长期保留 | 属于用户核心资产 |
| 打字记录 | 180 天或长期 | 可按统计需求保留 |
| AI 对话 | 90-180 天 | 可支持用户手动删除 |
| 游戏记录 | 180 天或长期 | 视排行榜和成就需求而定 |
| 邮箱验证码 | 15 分钟 | 到期即失效 |
| 限流记录 | 1 分钟到 24 小时 | 按业务类型定 TTL |
| Refresh Token 黑名单 | 至 token 自然过期 | 避免重复使用 |

### 9.2 清理策略建议

- 使用定时任务清理过期验证码
- 清理失效 Refresh Token 黑名单
- 定期归档或清理历史 AI 对话
- 对超长时间未使用的行为记录按策略归档

## 十、种子数据与初始化建议

### 10.1 初始化范围

建议初始化的数据包括：

- 默认应用版本数据
- 临时邮箱黑名单基础数据
- 最小题库元数据
- 开发环境测试账号（仅开发环境）

### 10.2 初始化原则

1. 生产环境不写死演示账号。
2. 题库主数据以 `packages/question-bank/` 为准，数据库只保存必要索引、缓存或扩展信息。
3. 初始化脚本要支持重复执行，不因重复执行产生脏数据。

### 10.3 建议目录

```text
server/
├── migrations/
├── seeds/
│   ├── 001_app_versions.sql
│   ├── 002_disposable_domains.sql
│   └── 003_dev_users.sql
```

## 十一、补充说明

### 11.1 枚举值建议

建议对下面这些字段维护统一枚举文档或常量：

- `users.status`
- `learning_progress.module`
- `typing_records.mode`
- `typing_records.difficulty`
- `game_records.game_type`
- `app_versions.platform`

### 11.2 时区与时间规则

- 数据库存储统一使用 UTC
- 接口时间字段统一返回带时区的标准时间；文档示例统一按 `YYYY-MM-DD HH:mm:ss UTC+8` 展示
- 前端显示时按用户语言和时区本地化

### 11.3 审计与追踪建议

如果后续引入审计日志，建议至少记录：

- 账户状态变化
- AI 配置变更
- 用户注销
- 版本发布
- 批量数据导入
