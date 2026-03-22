# 后端开发指南

## 一、技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Go | 1.22+ | 语言 |
| Gin | 1.10 | HTTP框架 |
| GORM | 2.0 | ORM |
| go-redis | 9.x | Redis客户端 |
| golang-jwt | 5.x | JWT |
| golang.org/x/oauth2 | latest | OAuth2客户端 |
| viper | 1.18 | 配置管理 |
| zap | 1.27 | 结构化日志 |
| golang-migrate | 4.x | 数据库迁移 |
| validator | 10.x | 参数校验 |
| bcrypt | latest | 密码哈希 |
| crypto/aes | stdlib | API Key加密 |

## 二、项目结构

```
server/
├── cmd/
│   └── server/
│       └── main.go                 # 入口
│
├── internal/
│   ├── config/
│   │   └── config.go               # Viper配置加载
│   │
│   ├── middleware/
│   │   ├── auth.go                 # JWT认证中间件
│   │   ├── cors.go                 # CORS配置
│   │   ├── ratelimit.go            # Redis限流
│   │   ├── logger.go               # 请求日志 (zap)
│   │   ├── recovery.go             # panic恢复
│   │   └── request_id.go           # 请求ID追踪
│   │
│   ├── handler/
│   │   ├── auth_handler.go         # 认证接口
│   │   ├── user_handler.go         # 用户接口
│   │   ├── learn_handler.go        # 学习接口
│   │   ├── typing_handler.go       # 打字接口
│   │   ├── ai_handler.go           # AI代理接口
│   │   ├── game_handler.go         # 游戏接口
│   │   └── version_handler.go      # 版本接口
│   │
│   ├── service/
│   │   ├── auth_service.go         # 认证逻辑
│   │   ├── user_service.go         # 用户逻辑
│   │   ├── learn_service.go        # 学习逻辑 + SRS算法
│   │   ├── typing_service.go       # 打字统计
│   │   ├── ai_service.go           # AI代理 + SSE
│   │   ├── game_service.go         # 游戏逻辑
│   │   ├── email_service.go        # 邮件发送
│   │   └── version_service.go      # 版本管理
│   │
│   ├── repository/
│   │   ├── user_repo.go
│   │   ├── learn_repo.go
│   │   ├── typing_repo.go
│   │   ├── ai_repo.go
│   │   ├── game_repo.go
│   │   └── version_repo.go
│   │
│   ├── model/
│   │   ├── user.go                 # User, UserOAuthLink, UserSettings
│   │   ├── learn.go                # LearningProgress
│   │   ├── typing.go               # TypingRecord
│   │   ├── ai.go                   # AIConversation
│   │   ├── game.go                 # GameRecord
│   │   ├── version.go              # AppVersion
│   │   └── email.go                # EmailVerification
│   │
│   ├── dto/
│   │   ├── request.go              # 请求DTO (带validate标签)
│   │   └── response.go             # 响应DTO
│   │
│   ├── router/
│   │   └── router.go               # 路由注册
│   │
│   └── pkg/
│       ├── oauth/
│       │   ├── google.go
│       │   ├── github.go
│       │   └── linuxdo.go
│       ├── email/
│       │   └── smtp.go
│       ├── ai/
│       │   └── proxy.go            # OpenAI兼容代理
│       ├── jwt/
│       │   └── jwt.go
│       ├── crypto/
│       │   └── aes.go              # AES加解密
│       ├── disposable/
│       │   └── checker.go          # 临时邮箱检测
│       ├── srs/
│       │   └── sm2.go              # SM-2间隔重复算法
│       └── response/
│           └── response.go         # 统一响应封装
│
├── migrations/
│   ├── 000001_init_schema.up.sql
│   ├── 000001_init_schema.down.sql
│   └── ...
│
├── data/
│   └── disposable_domains.txt      # 临时邮箱域名列表
│
├── config.yaml                     # 配置文件
├── config.example.yaml             # 配置模板
├── go.mod
├── go.sum
├── Makefile
└── .air.toml                       # hot reload配置
```

## 三、核心代码模式

### 3.1 启动入口

```go
// cmd/server/main.go
package main

import (
    "context"
    "log"
    "net/http"
    "os/signal"
    "syscall"
    "time"

    "nihongo/internal/config"
    "nihongo/internal/router"
)

func main() {
    // 加载配置
    cfg := config.Load()

    // 初始化数据库
    db := config.InitDB(cfg)

    // 初始化Redis
    rdb := config.InitRedis(cfg)

    // 注册路由
    r := router.Setup(cfg, db, rdb)

    // 启动服务器
    srv := &http.Server{
        Addr:    cfg.Server.Host + ":" + cfg.Server.Port,
        Handler: r,
    }

    // 优雅关闭
    ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
    defer stop()

    go func() {
        log.Printf("Server starting on %s", srv.Addr)
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Server error: %v", err)
        }
    }()

    <-ctx.Done()
    log.Println("Shutting down...")

    shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    srv.Shutdown(shutdownCtx)
}
```

### 3.2 路由注册

```go
// internal/router/router.go
package router

func Setup(cfg *config.Config, db *gorm.DB, rdb *redis.Client) *gin.Engine {
    r := gin.New()

    // 全局中间件
    r.Use(middleware.RequestID())
    r.Use(middleware.Logger())
    r.Use(middleware.Recovery())
    r.Use(middleware.CORS(cfg))
    r.Use(middleware.RateLimit(rdb, 100, time.Second)) // 全局100次/秒

    // 初始化各层
    userRepo := repository.NewUserRepo(db)
    userService := service.NewUserService(userRepo, rdb)
    authHandler := handler.NewAuthHandler(userService, cfg)
    // ... 其他模块

    api := r.Group("/api")
    {
        // 健康检查
        api.GET("/health", handler.HealthCheck(db, rdb))

        // 认证 (公开)
        auth := api.Group("/auth")
        {
            auth.POST("/register", authHandler.Register)
            auth.POST("/login", authHandler.Login)
            auth.POST("/verify-email", authHandler.VerifyEmail)
            auth.POST("/refresh", authHandler.RefreshToken)
            auth.GET("/oauth/:provider", authHandler.OAuthRedirect)
            auth.GET("/callback/:provider", authHandler.OAuthCallback)
        }

        // 需要认证的路由
        protected := api.Group("")
        protected.Use(middleware.Auth(cfg.JWT.Secret))
        {
            protected.POST("/auth/logout", authHandler.Logout)

            // 用户
            user := protected.Group("/user")
            {
                user.GET("/profile", userHandler.GetProfile)
                user.PUT("/profile", userHandler.UpdateProfile)
                user.PUT("/ai-config", userHandler.UpdateAIConfig)
                user.DELETE("/account", userHandler.DeleteAccount)
            }

            // AI (需登录)
            ai := protected.Group("/ai")
            ai.Use(middleware.RateLimit(rdb, 10, time.Minute)) // AI限流
            {
                ai.POST("/chat", aiHandler.Chat)
                ai.POST("/generate-quiz", aiHandler.GenerateQuiz)
                ai.GET("/conversations", aiHandler.ListConversations)
                ai.GET("/conversations/:id", aiHandler.GetConversation)
                ai.DELETE("/conversations/:id", aiHandler.DeleteConversation)
            }
        }

        // 公开学习路由 (可选登录)
        learn := api.Group("/learn")
        learn.Use(middleware.OptionalAuth(cfg.JWT.Secret))
        {
            learn.GET("/kana", learnHandler.GetKana)
            learn.GET("/vocabulary", learnHandler.GetVocabulary)
            learn.GET("/grammar", learnHandler.GetGrammar)
            learn.GET("/progress", learnHandler.GetProgress)
            learn.POST("/progress", learnHandler.UpdateProgress)
            learn.GET("/review", learnHandler.GetReview)
        }

        // 公开打字路由
        typing := api.Group("/typing")
        typing.Use(middleware.OptionalAuth(cfg.JWT.Secret))
        {
            typing.GET("/content", typingHandler.GetContent)
            typing.POST("/record", typingHandler.SubmitRecord)
            typing.GET("/stats", typingHandler.GetStats)
        }

        // 公开游戏路由
        game := api.Group("/game")
        game.Use(middleware.OptionalAuth(cfg.JWT.Secret))
        {
            game.GET("/typing-race/config", gameHandler.GetTypingRaceConfig)
            game.GET("/typing-race/content", gameHandler.GetTypingRaceContent)
            game.POST("/typing-race/record", gameHandler.SubmitTypingRaceRecord)
            game.GET("/sokoban/levels", gameHandler.GetSokobanLevels)
            game.GET("/sokoban/levels/:id", gameHandler.GetSokobanLevel)
            game.POST("/sokoban/record", gameHandler.SubmitSokobanRecord)
        }

        // 版本
        api.GET("/version/check", versionHandler.CheckUpdate)
        api.GET("/version/changelog", versionHandler.GetChangelog)
    }

    return r
}
```

### 3.3 Handler 模式

```go
// internal/handler/auth_handler.go
package handler

type AuthHandler struct {
    userService *service.UserService
    cfg         *config.Config
}

func NewAuthHandler(us *service.UserService, cfg *config.Config) *AuthHandler {
    return &AuthHandler{userService: us, cfg: cfg}
}

func (h *AuthHandler) Register(c *gin.Context) {
    var req dto.RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        response.BadRequest(c, "参数错误: "+err.Error())
        return
    }

    err := h.userService.Register(c.Request.Context(), &req)
    if err != nil {
        response.Error(c, err)
        return
    }

    response.OK(c, gin.H{
        "email":      req.Email,
        "expires_in": 900,
    })
}
```

### 3.4 Service 模式

```go
// internal/service/auth_service.go
package service

type UserService struct {
    userRepo    *repository.UserRepo
    rdb         *redis.Client
    emailSvc    *EmailService
    disposable  *disposable.Checker
}

func (s *UserService) Register(ctx context.Context, req *dto.RegisterRequest) error {
    // 1. 检查临时邮箱
    if s.disposable.IsDisposable(req.Email) {
        return errors.NewBizError(40202, "不支持临时邮箱注册")
    }

    // 2. 检查邮箱是否已注册
    exists, _ := s.userRepo.ExistsByEmail(ctx, req.Email)
    if exists {
        return errors.NewBizError(40201, "邮箱已注册")
    }

    // 3. 发送验证码
    code := generateCode(6)
    err := s.rdb.Set(ctx, "verify:"+req.Email, code, 15*time.Minute).Err()
    if err != nil {
        return err
    }

    // 4. 异步发送邮件
    go s.emailSvc.SendVerificationCode(req.Email, code)

    return nil
}
```

### 3.5 统一响应

```go
// internal/pkg/response/response.go
package response

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type Response struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data"`
}

func OK(c *gin.Context, data interface{}) {
    c.JSON(http.StatusOK, Response{Code: 0, Message: "success", Data: data})
}

func BadRequest(c *gin.Context, msg string) {
    c.JSON(http.StatusBadRequest, Response{Code: 40000, Message: msg})
}

func Unauthorized(c *gin.Context) {
    c.JSON(http.StatusUnauthorized, Response{Code: 40001, Message: "未授权"})
}

func Error(c *gin.Context, err error) {
    if bizErr, ok := err.(*errors.BizError); ok {
        c.JSON(http.StatusBadRequest, Response{Code: bizErr.Code, Message: bizErr.Message})
        return
    }
    c.JSON(http.StatusInternalServerError, Response{Code: 50000, Message: "内部错误"})
}
```

## 四、OAuth2 实现

### 4.1 LinuxDo OAuth2

```go
// internal/pkg/oauth/linuxdo.go
package oauth

import (
    "context"
    "encoding/json"
    "golang.org/x/oauth2"
)

type LinuxDoProvider struct {
    config *oauth2.Config
    userInfoURL string
}

func NewLinuxDoProvider(cfg *config.OAuthConfig) *LinuxDoProvider {
    return &LinuxDoProvider{
        config: &oauth2.Config{
            ClientID:     cfg.ClientID,
            ClientSecret: cfg.ClientSecret,
            RedirectURL:  cfg.RedirectURL,
            Scopes:       []string{"openid", "profile", "email"},
            Endpoint: oauth2.Endpoint{
                AuthURL:  "https://connect.linux.do/oauth2/authorize",
                TokenURL: "https://connect.linux.do/oauth2/token",
            },
        },
        userInfoURL: "https://connect.linux.do/api/user",
    }
}

func (p *LinuxDoProvider) GetAuthURL(state string) string {
    return p.config.AuthCodeURL(state)
}

func (p *LinuxDoProvider) Exchange(ctx context.Context, code string) (*OAuthUser, error) {
    token, err := p.config.Exchange(ctx, code)
    if err != nil {
        return nil, err
    }

    client := p.config.Client(ctx, token)
    resp, err := client.Get(p.userInfoURL)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var userInfo map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&userInfo)

    return &OAuthUser{
        Provider:   "linuxdo",
        ProviderID: fmt.Sprintf("%v", userInfo["id"]),
        Email:      getStringField(userInfo, "email"),
        Name:       getStringField(userInfo, "username"),
        Avatar:     getStringField(userInfo, "avatar_url"),
    }, nil
}
```

## 五、AI代理 (SSE流式)

```go
// internal/handler/ai_handler.go
func (h *AIHandler) Chat(c *gin.Context) {
    var req dto.ChatRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        response.BadRequest(c, err.Error())
        return
    }

    userID := middleware.GetUserID(c)

    // 获取用户AI配置
    aiConfig, err := h.userService.GetAIConfig(c.Request.Context(), userID)
    if err != nil {
        response.Error(c, err)
        return
    }

    // 设置SSE头
    c.Header("Content-Type", "text/event-stream")
    c.Header("Cache-Control", "no-cache")
    c.Header("Connection", "keep-alive")

    // 流式转发
    err = h.aiService.StreamChat(c.Request.Context(), aiConfig, &req, func(chunk string) {
        c.SSEvent("", gin.H{"type": "delta", "content": chunk})
        c.Writer.Flush()
    })

    if err != nil {
        c.SSEvent("", gin.H{"type": "error", "message": err.Error()})
    } else {
        c.SSEvent("", gin.H{"type": "done"})
    }
    c.Writer.Flush()
}
```

```go
// internal/pkg/ai/proxy.go
package ai

func (p *Proxy) StreamChat(ctx context.Context, cfg *AIConfig, messages []Message, onChunk func(string)) error {
    reqBody := map[string]interface{}{
        "model":    cfg.Model,
        "messages": messages,
        "stream":   true,
    }

    body, _ := json.Marshal(reqBody)
    req, _ := http.NewRequestWithContext(ctx, "POST", cfg.BaseURL+"/chat/completions", bytes.NewReader(body))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+cfg.APIKey)

    client := &http.Client{Timeout: 60 * time.Second}
    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    scanner := bufio.NewScanner(resp.Body)
    for scanner.Scan() {
        line := scanner.Text()
        if !strings.HasPrefix(line, "data: ") {
            continue
        }
        data := strings.TrimPrefix(line, "data: ")
        if data == "[DONE]" {
            break
        }

        var chunk struct {
            Choices []struct {
                Delta struct {
                    Content string `json:"content"`
                } `json:"delta"`
            } `json:"choices"`
        }
        if json.Unmarshal([]byte(data), &chunk) == nil && len(chunk.Choices) > 0 {
            content := chunk.Choices[0].Delta.Content
            if content != "" {
                onChunk(content)
            }
        }
    }
    return nil
}
```

## 六、SM-2 间隔重复算法

```go
// internal/pkg/srs/sm2.go
package srs

import (
    "math"
    "time"
)

// SM2Result SM-2算法计算结果
type SM2Result struct {
    Level       int       // 新等级
    EaseFactor  float64   // 新难度因子
    IntervalDays int      // 下次复习间隔(天)
    NextReview  time.Time // 下次复习时间
}

// Quality 回答质量 (0-5)
// 5=完美记忆 4=稍有犹豫 3=勉强记得 2=模糊记忆 1=完全忘记 0=连题目都不认识
type Quality int

// Calculate 根据SM-2算法计算下次复习时间
func Calculate(level int, easeFactor float64, intervalDays int, quality Quality) SM2Result {
    q := int(quality)

    // 新的EaseFactor
    newEF := easeFactor + (0.1 - float64(5-q)*(0.08+float64(5-q)*0.02))
    if newEF < 1.3 {
        newEF = 1.3
    }

    var newInterval int
    var newLevel int

    if q >= 3 { // 回答正确
        newLevel = level + 1
        switch level {
        case 0:
            newInterval = 1
        case 1:
            newInterval = 6
        default:
            newInterval = int(math.Round(float64(intervalDays) * newEF))
        }
    } else { // 回答错误，重新开始
        newLevel = 0
        newInterval = 1
        newEF = easeFactor // 不降低EF
    }

    return SM2Result{
        Level:        newLevel,
        EaseFactor:   newEF,
        IntervalDays: newInterval,
        NextReview:   time.Now().AddDate(0, 0, newInterval),
    }
}
```

## 七、Makefile

```makefile
.PHONY: dev build test lint migrate

# 开发运行 (热重载)
dev:
	air -c .air.toml

# 编译
build:
	go build -o bin/server cmd/server/main.go

# 测试
test:
	go test ./... -v -cover

# 代码检查
lint:
	golangci-lint run

# 数据库迁移
migrate-up:
	migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/nihongo?sslmode=disable" up

migrate-down:
	migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/nihongo?sslmode=disable" down 1

# 生成swagger文档 (可选)
swagger:
	swag init -g cmd/server/main.go -o docs/swagger
```

## 八、测试规范

```go
// internal/service/auth_service_test.go
func TestRegister_DisposableEmail(t *testing.T) {
    svc := setupTestService(t)

    err := svc.Register(context.Background(), &dto.RegisterRequest{
        Email:    "test@tempmail.com",
        Password: "Test1234",
        Username: "tester",
    })

    assert.Error(t, err)
    assert.Contains(t, err.Error(), "临时邮箱")
}

func TestRegister_Success(t *testing.T) {
    svc := setupTestService(t)

    err := svc.Register(context.Background(), &dto.RegisterRequest{
        Email:    "test@gmail.com",
        Password: "Test1234",
        Username: "tester",
    })

    assert.NoError(t, err)
}
```
