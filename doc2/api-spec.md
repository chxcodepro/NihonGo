# API 接口规范文档

## 一、通用约定

### 1.1 基础信息
- **Base URL**: `https://your-domain.com/api`
- **协议**: HTTPS
- **编码**: UTF-8
- **时间展示示例**: `2024-01-15 16:30:00 UTC+8`
- **时间说明**: 接口时间字段统一返回带时区的标准时间；本文档示例为了便于阅读，统一按 `YYYY-MM-DD HH:mm:ss UTC+8` 展示

### 1.2 统一响应格式

```json
// 成功
{
    "code": 0,
    "message": "success",
    "data": { ... }
}

// 失败
{
    "code": 40001,
    "message": "邮箱格式不正确",
    "data": null
}

// 分页
{
    "code": 0,
    "message": "success",
    "data": {
        "list": [...],
        "total": 100,
        "page": 1,
        "page_size": 20
    }
}
```

### 1.3 错误码规范

| 范围 | 模块 | 示例 |
|------|------|------|
| 40000-40099 | 通用错误 | 40000=参数错误, 40001=未授权, 40003=禁止, 40004=未找到 |
| 40100-40199 | 认证错误 | 40101=Token过期, 40102=Token无效, 40103=账号被禁用 |
| 40200-40299 | 用户错误 | 40201=邮箱已注册, 40202=临时邮箱, 40203=验证码错误 |
| 40300-40399 | 学习模块 | 40301=模块不存在, 40302=知识点不存在 |
| 40400-40499 | AI模块 | 40401=AI配置无效, 40402=AI请求超时, 40403=AI限流 |
| 40500-40599 | 游戏模块 | 40501=关卡不存在, 40502=游戏状态异常 |
| 50000-50099 | 服务器错误 | 50000=内部错误, 50001=数据库错误, 50002=Redis错误 |

### 1.4 认证方式

```
Authorization: Bearer <access_token>
```

需要认证的接口标注 `[AUTH]`，不需要的标注 `[PUBLIC]`。

### 1.5 分页、过滤、排序约定

列表类接口统一遵循下面约定，避免各模块分页参数不一致：

#### 分页参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | int | 1 | 页码，从 1 开始 |
| `page_size` | int | 20 | 每页数量，最大 100 |

#### 过滤参数

- 按模块定义具体过滤字段，但命名应尽量语义化
- 多值过滤优先使用逗号分隔，如 `level=N5,N4`
- 布尔过滤使用 `true` / `false`
- 时间范围过滤统一使用：
  - `start_at`
  - `end_at`

#### 排序参数

统一使用：

- `sort_by`：排序字段
- `sort_order`：`asc` / `desc`

如果某接口不支持排序，需要在接口描述里明确写出来。

#### 分页响应

```json
{
    "code": 0,
    "message": "success",
    "data": {
        "list": [],
        "total": 128,
        "page": 1,
        "page_size": 20,
        "has_more": true
    }
}
```

### 1.6 幂等约定

为了避免重复提交造成脏数据，下面这些写操作需要遵循幂等原则：

- 邮箱验证码发送
- 学习进度保存
- 打字记录提交
- 游戏成绩提交
- AI 会话删除

约定如下：

1. 同一用户、同一业务、同一短时间窗口内的重复请求，服务端应避免重复写入明显重复数据。
2. 对“覆盖型写入”接口，如学习进度更新，应以后一次有效请求为准。
3. 对“记录型写入”接口，如成绩提交，应在服务端做必要去重，至少避免前端重复点击导致的连续重复记录。
4. 如后续接入显式幂等键，统一使用请求头：

```http
Idempotency-Key: <unique-request-id>
```

### 1.7 限流与重试约定

当接口触发限流时，统一返回：

- HTTP 状态码：`429`
- 业务错误码：对应模块限流错误码

示例：

```json
{
    "code": 40403,
    "message": "请求过于频繁，请稍后再试",
    "data": {
        "retry_after": 60
    }
}
```

其中：

- `retry_after` 单位为秒
- 前端在可重试场景下应根据该值控制重试节奏

### 1.8 SSE 事件格式约定

AI 对话等流式接口统一使用 `text/event-stream`，事件格式建议如下：

#### 事件类型

| 事件名 | 说明 |
|--------|------|
| `start` | 流开始 |
| `chunk` | 文本片段 |
| `done` | 流结束 |
| `error` | 流异常 |

#### 事件示例

```text
event: start
data: {"conversation_id":"conv_001","message_id":"msg_001"}

event: chunk
data: {"content":"こんにちは","delta":"こん"}

event: chunk
data: {"content":"こんにちは！","delta":"にちは！"}

event: done
data: {"finish_reason":"stop","usage":{"prompt_tokens":120,"completion_tokens":56}}
```

#### 断线重连建议

- 前端仅对网络中断类错误做有限次重连
- 已收到 `done` 事件后不得再次重连补流
- 如服务端返回 `error` 事件，前端应直接结束当前流并提示用户
- 如后续支持断点续流，需新增 `last_event_id` 约定并单独说明

---

## 二、认证模块 `/api/auth`

### 2.1 邮箱注册 `[PUBLIC]`

```
POST /api/auth/register
```

**Request:**
```json
{
    "email": "user@example.com",
    "password": "MyP@ssw0rd",
    "username": "nihongo_learner"
}
```

**Response (200):**
```json
{
    "code": 0,
    "message": "验证码已发送到邮箱",
    "data": {
        "email": "user@example.com",
        "expires_in": 900
    }
}
```

**校验规则:**
- email: 合法邮箱格式，非临时邮箱域名
- password: 8-64位，至少包含字母和数字
- username: 2-50位，字母/数字/下划线/中日文

### 2.2 验证邮箱 `[PUBLIC]`

```
POST /api/auth/verify-email
```

**Request:**
```json
{
    "email": "user@example.com",
    "code": "123456",
    "purpose": "register"
}
```

**Response (200):**
```json
{
    "code": 0,
    "message": "注册成功",
    "data": {
        "access_token": "eyJhbG...",
        "refresh_token": "eyJhbG...",
        "expires_in": 900,
        "user": {
            "id": 1,
            "username": "nihongo_learner",
            "email": "user@example.com",
            "avatar_url": "",
            "locale": "zh-CN",
            "theme": "system"
        }
    }
}
```

### 2.3 邮箱登录 `[PUBLIC]`

```
POST /api/auth/login
```

**Request:**
```json
{
    "email": "user@example.com",
    "password": "MyP@ssw0rd"
}
```

**Response:** 同 2.2 的成功响应。

### 2.4 刷新Token `[PUBLIC]`

```
POST /api/auth/refresh
```

**Request:**
```json
{
    "refresh_token": "eyJhbG..."
}
```

**Response (200):**
```json
{
    "code": 0,
    "data": {
        "access_token": "new_eyJhbG...",
        "refresh_token": "new_eyJhbG...",
        "expires_in": 900
    }
}
```

### 2.5 登出 `[AUTH]`

```
POST /api/auth/logout
```

**Response:** `{"code": 0, "message": "已登出"}`

### 2.6 发起OAuth2 `[PUBLIC]`

```
GET /api/auth/oauth/:provider
```

**参数:** provider = `google` | `github` | `linuxdo`

**Response:** 302重定向到第三方授权页

### 2.7 OAuth2回调 `[PUBLIC]`

```
GET /api/auth/callback/:provider?code=xxx&state=xxx
```

**Response:** 302重定向到前端页面，URL携带token参数:
```
https://your-domain.com/auth/callback?access_token=xxx&refresh_token=xxx
```

---

## 三、用户模块 `/api/user`

### 3.1 获取个人信息 `[AUTH]`

```
GET /api/user/profile
```

**Response:**
```json
{
    "code": 0,
    "data": {
        "id": 1,
        "username": "nihongo_learner",
        "email": "user@example.com",
        "avatar_url": "https://...",
        "email_verified": true,
        "locale": "zh-CN",
        "theme": "dark",
        "oauth_providers": ["google", "github"],
        "settings": {
            "ai_base_url": "https://api.openai.com/v1",
            "ai_model": "gpt-4o-mini",
            "tts_rate": 0.9,
            "typing_layout": "romaji",
            "daily_goal": 20
        },
        "stats": {
            "study_days": 30,
            "total_words": 500,
            "total_grammar": 50,
            "streak_days": 7
        },
        "created_at": "2024-01-01 08:00:00 UTC+8"
    }
}
```

### 3.2 更新个人信息 `[AUTH]`

```
PUT /api/user/profile
```

**Request:**
```json
{
    "username": "new_name",
    "locale": "ja",
    "theme": "dark"
}
```

### 3.3 更新AI配置 `[AUTH]`

```
PUT /api/user/ai-config
```

**Request:**
```json
{
    "ai_base_url": "https://api.openai.com/v1",
    "ai_api_key": "sk-xxxxx",
    "ai_model": "gpt-4o-mini"
}
```

**说明:** apiKey 在后端 AES 加密后存入数据库。

### 3.4 注销账户 `[AUTH]`

```
DELETE /api/user/account
```

**Request:**
```json
{
    "password": "确认密码",
    "reason": "不再使用"
}
```

---

## 四、学习模块 `/api/learn`

### 4.1 获取五十音数据 `[PUBLIC]`

```
GET /api/learn/kana?type=hiragana
```

**Query:** type = `hiragana` | `katakana` | `all`

**Response:**
```json
{
    "code": 0,
    "data": {
        "hiragana": [
            {
                "id": "hiragana_a",
                "char": "あ",
                "romaji": "a",
                "row": "a_row",
                "column": 1,
                "stroke_svg": "/assets/strokes/hiragana_a.svg",
                "audio_text": "あ"
            }
        ]
    }
}
```

### 4.2 获取词汇列表 `[PUBLIC]`

```
GET /api/learn/vocabulary?level=n5&page=1&page_size=20
```

**Response:**
```json
{
    "code": 0,
    "data": {
        "list": [
            {
                "id": "vocab_n5_001",
                "word": "食べる",
                "reading": "たべる",
                "romaji": "taberu",
                "meaning_zh": "吃",
                "meaning_en": "to eat",
                "part_of_speech": "动词",
                "jlpt_level": "N5",
                "examples": [
                    {
                        "japanese": "ご飯を食べる",
                        "reading": "ごはんをたべる",
                        "meaning": "吃饭"
                    }
                ],
                "tags": ["动词", "日常"]
            }
        ],
        "total": 800,
        "page": 1,
        "page_size": 20
    }
}
```

### 4.3 获取语法列表 `[PUBLIC]`

```
GET /api/learn/grammar?level=n5&page=1&page_size=20
```

**Response:**
```json
{
    "code": 0,
    "data": {
        "list": [
            {
                "id": "grammar_n5_001",
                "title": "〜は〜です",
                "meaning": "...是...",
                "explanation": "最基本的判断句，用于表示A是B",
                "structure": "名词 + は + 名词 + です",
                "jlpt_level": "N5",
                "examples": [
                    {
                        "japanese": "私は学生です。",
                        "reading": "わたしはがくせいです。",
                        "meaning": "我是学生。"
                    }
                ],
                "notes": "は在这里读作'wa'而不是'ha'"
            }
        ],
        "total": 50,
        "page": 1,
        "page_size": 20
    }
}
```

### 4.4 获取学习进度 `[AUTH]`

```
GET /api/learn/progress?module=vocabulary
```

**Response:**
```json
{
    "code": 0,
    "data": {
        "module": "vocabulary",
        "total_items": 800,
        "learned": 150,
        "mastered": 80,
        "due_review": 25,
        "progress_percent": 18.75,
        "items": [
            {
                "item_id": "vocab_n5_001",
                "level": 5,
                "next_review": "2024-01-20 16:00:00 UTC+8",
                "review_count": 10,
                "correct_rate": 0.9
            }
        ]
    }
}
```

### 4.5 更新学习进度 `[AUTH]`

```
POST /api/learn/progress
```

**Request:**
```json
{
    "module": "vocabulary",
    "item_id": "vocab_n5_001",
    "correct": true,
    "response_time_ms": 2500
}
```

**说明:** 后端根据SM-2算法计算下次复习时间。

### 4.6 获取待复习项 `[AUTH]`

```
GET /api/learn/review?module=vocabulary&limit=20
```

**Response:**
```json
{
    "code": 0,
    "data": {
        "items": [
            {
                "item_id": "vocab_n5_001",
                "module": "vocabulary",
                "level": 3,
                "overdue_days": 2,
                "content": { ... }
            }
        ],
        "total_due": 25
    }
}
```

---

## 五、打字模块 `/api/typing`

### 5.1 获取打字内容 `[PUBLIC]`

```
GET /api/typing/content?mode=romaji&difficulty=beginner
```

**Response:**
```json
{
    "code": 0,
    "data": {
        "id": "typing_beginner_001",
        "mode": "romaji",
        "difficulty": "beginner",
        "title": "基础平假名练习",
        "content": [
            {
                "display": "あ",
                "answer": "a"
            },
            {
                "display": "い",
                "answer": "i"
            }
        ],
        "time_limit_sec": 120
    }
}
```

### 5.2 提交打字记录 `[AUTH - 可选]`

```
POST /api/typing/record
```

**Request:**
```json
{
    "mode": "romaji",
    "difficulty": "beginner",
    "content_id": "typing_beginner_001",
    "wpm": 45.5,
    "accuracy": 0.92,
    "total_chars": 100,
    "correct_chars": 92,
    "duration_sec": 132,
    "error_chars": [
        {"expected": "shi", "typed": "si", "position": 15}
    ]
}
```

### 5.3 获取打字统计 `[AUTH]`

```
GET /api/typing/stats?period=week
```

**Response:**
```json
{
    "code": 0,
    "data": {
        "avg_wpm": 52.3,
        "avg_accuracy": 0.94,
        "total_practice_sec": 3600,
        "total_chars": 5000,
        "best_wpm": 78.5,
        "trend": [
            {"date": "2024-01-15", "wpm": 45.0, "accuracy": 0.91},
            {"date": "2024-01-16", "wpm": 48.5, "accuracy": 0.93}
        ],
        "common_errors": [
            {"char": "shi", "error_count": 15, "common_mistake": "si"},
            {"char": "tsu", "error_count": 10, "common_mistake": "tu"}
        ]
    }
}
```

---

## 六、AI模块 `/api/ai`

### 6.1 AI对话 (SSE流式) `[AUTH]`

```
POST /api/ai/chat
Content-Type: application/json
Accept: text/event-stream
```

**Request:**
```json
{
    "conversation_id": 1,
    "message": "こんにちは、自己紹介をお願いします",
    "scenario": "introduce"
}
```

**Response (SSE Stream):**
```
data: {"type":"start","conversation_id":1}

data: {"type":"delta","content":"こん"}

data: {"type":"delta","content":"にち"}

data: {"type":"delta","content":"は！"}

data: {"type":"done","usage":{"prompt_tokens":50,"completion_tokens":100}}
```

### 6.2 AI生成题目 `[AUTH]`

```
POST /api/ai/generate-quiz
```

**Request:**
```json
{
    "module": "vocabulary",
    "item_ids": ["vocab_n5_001", "vocab_n5_002"],
    "count": 5,
    "types": ["choice", "fill", "translate"]
}
```

**Response:**
```json
{
    "code": 0,
    "data": {
        "quizzes": [
            {
                "type": "choice",
                "question": "「食べる」的意思是？",
                "options": ["吃", "喝", "睡", "走"],
                "answer": 0,
                "explanation": "食べる(たべる)是'吃'的意思"
            },
            {
                "type": "fill",
                "question": "私は毎日ご飯を___ます。",
                "answer": "食べ",
                "hint": "吃(动词连用形)"
            },
            {
                "type": "translate",
                "question": "请将以下句子翻译成日语：我每天吃饭。",
                "answer": "私は毎日ご飯を食べます。",
                "acceptable_answers": [
                    "毎日ご飯を食べます",
                    "私は毎日ご飯を食べます"
                ]
            }
        ]
    }
}
```

### 6.3 获取对话列表 `[AUTH]`

```
GET /api/ai/conversations?page=1&page_size=20
```

### 6.4 获取对话详情 `[AUTH]`

```
GET /api/ai/conversations/:id
```

### 6.5 删除对话 `[AUTH]`

```
DELETE /api/ai/conversations/:id
```

---

## 七、游戏模块 `/api/game`

### 7.1 获取打字竞速配置 `[PUBLIC]`

```
GET /api/game/typing-race/config
```

**Response:**
```json
{
    "code": 0,
    "data": {
        "difficulties": [
            {"id": "easy", "label": "初学者", "ai_wpm": 30},
            {"id": "normal", "label": "中级", "ai_wpm": 60},
            {"id": "hard", "label": "高手", "ai_wpm": 120}
        ],
        "content_types": [
            {"id": "hiragana", "label": "平假名"},
            {"id": "katakana", "label": "片假名"},
            {"id": "words", "label": "单词"},
            {"id": "sentences", "label": "句子"}
        ]
    }
}
```

### 7.2 获取竞速内容 `[PUBLIC]`

```
GET /api/game/typing-race/content?difficulty=normal&type=words
```

### 7.3 提交竞速记录 `[AUTH - 可选]`

```
POST /api/game/typing-race/record
```

### 7.4 获取推箱子关卡列表 `[PUBLIC]`

```
GET /api/game/sokoban/levels?page=1&page_size=20
```

**Response:**
```json
{
    "code": 0,
    "data": {
        "list": [
            {
                "id": 1,
                "title": "は的用法",
                "difficulty": "easy",
                "grammar_points": ["は"],
                "grid_size": {"rows": 5, "cols": 5},
                "description": "将「は」推到主语后面",
                "min_moves": 10,
                "unlocked": true
            }
        ],
        "total": 50
    }
}
```

### 7.5 获取推箱子关卡数据 `[PUBLIC]`

```
GET /api/game/sokoban/levels/:id
```

**Response:**
```json
{
    "code": 0,
    "data": {
        "id": 1,
        "grid": [
            [0, 0, 1, 1, 1],
            [0, 0, 1, 4, 1],
            [1, 1, 1, 0, 1],
            [1, 3, 2, 0, 1],
            [1, 1, 1, 1, 1]
        ],
        "legend": {
            "0": "空地",
            "1": "墙壁",
            "2": "箱子(语法成分)",
            "3": "目标位置",
            "4": "玩家"
        },
        "boxes": [
            {"position": [3, 2], "label": "は", "type": "particle"}
        ],
        "targets": [
            {"position": [3, 1], "label": "主语后", "expected": "は"}
        ],
        "sentence": {
            "template": "私___学生です",
            "answer": "私は学生です",
            "meaning": "我是学生"
        }
    }
}
```

### 7.6 提交推箱子记录 `[AUTH - 可选]`

```
POST /api/game/sokoban/record
```

---

## 八、版本模块 `/api/version`

### 8.1 检查更新 `[PUBLIC]`

```
GET /api/version/check?platform=windows&current_version=1.0.0
```

**Response:**
```json
{
    "code": 0,
    "data": {
        "has_update": true,
        "latest_version": "1.1.0",
        "version_code": 110,
        "download_url": "https://github.com/.../releases/download/v1.1.0/nihongo-1.1.0.msi",
        "changelog": "## v1.1.0\n- 新增推箱子游戏\n- 修复TTS偶尔不出声的问题",
        "force_update": false,
        "min_version": "1.0.0",
        "published_at": "2024-02-01 08:00:00 UTC+8"
    }
}
```

### 8.2 获取更新日志 `[PUBLIC]`

```
GET /api/version/changelog?platform=windows&limit=10
```

---

## 九、健康检查 `/api/health`

### 9.1 健康检查 `[PUBLIC]`

```
GET /api/health
```

**Response:**
```json
{
    "code": 0,
    "data": {
        "status": "healthy",
        "version": "1.0.0",
        "uptime": "72h30m15s",
        "services": {
            "database": "ok",
            "redis": "ok"
        }
    }
}
```

---

## 十、附录

### 10.1 错误码总表

在通用错误码规范基础上，补充推荐使用的常见错误码如下：

| 错误码 | 含义 | 说明 |
|--------|------|------|
| 40000 | 参数错误 | 请求参数缺失、格式不对、类型不对 |
| 40001 | 未授权 | 未登录或未携带有效凭证 |
| 40003 | 禁止访问 | 已登录，但没有权限 |
| 40004 | 资源不存在 | 请求资源不存在 |
| 40029 | 请求过于频繁 | 通用限流 |
| 40101 | Access Token 过期 | 需要刷新或重新登录 |
| 40102 | Access Token 无效 | 签名错误、格式错误或被篡改 |
| 40103 | 账号被禁用 | 用户状态不允许登录 |
| 40104 | Refresh Token 失效 | 需要重新登录 |
| 40105 | OAuth state 无效 | OAuth 防 CSRF 校验失败 |
| 40201 | 邮箱已注册 | 注册冲突 |
| 40202 | 临时邮箱不允许 | 命中临时邮箱黑名单 |
| 40203 | 验证码错误 | 邮箱验证码不匹配 |
| 40204 | 验证码已过期 | 超过有效时间 |
| 40301 | 模块不存在 | 学习模块错误 |
| 40302 | 知识点不存在 | 题库项不存在 |
| 40303 | 学习进度保存失败 | 持久化失败 |
| 40401 | AI 配置无效 | 缺少 base_url、key、model 等 |
| 40402 | AI 请求超时 | 上游长时间无响应 |
| 40403 | AI 请求限流 | AI 模块单独限流 |
| 40404 | AI 上游服务异常 | 上游返回异常 |
| 40501 | 关卡不存在 | 游戏关卡错误 |
| 40502 | 游戏状态异常 | 状态流转不合法 |
| 40503 | 游戏成绩提交失败 | 记录写入失败 |
| 50000 | 内部错误 | 未分类服务器错误 |
| 50001 | 数据库错误 | PostgreSQL 相关异常 |
| 50002 | Redis 错误 | Redis 相关异常 |
| 50003 | 第三方依赖错误 | OAuth、邮件、AI 等外部依赖异常 |

### 10.2 列表接口推荐统一参数

适用于大部分列表接口的查询参数推荐如下：

| 参数 | 说明 |
|------|------|
| `page` | 页码 |
| `page_size` | 每页数量 |
| `level` | JLPT 等级或难度等级 |
| `keyword` | 关键词搜索 |
| `sort_by` | 排序字段 |
| `sort_order` | 排序方向 |
| `start_at` | 开始时间 |
| `end_at` | 结束时间 |

如某接口不支持其中某些参数，应在接口定义里明确标注“不支持”而不是静默忽略。
