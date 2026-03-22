# 安全规范文档

## 一、安全总览

### 威胁模型

| 威胁 | 风险 | 防护措施 |
|------|------|---------|
| 未授权访问 | 高 | JWT认证 + 权限校验 |
| SQL注入 | 高 | GORM参数化查询 |
| XSS | 高 | React自动转义 + CSP |
| CSRF | 中 | SameSite Cookie + CORS |
| 暴力破解 | 中 | 限流 + 账户锁定 |
| 临时邮箱滥用 | 中 | 域名黑名单 |
| API Key泄露 | 高 | AES加密存储 |
| 数据泄露 | 高 | HTTPS + 加密存储 |
| DDoS | 中 | Nginx限流 + Redis限流 |

## 二、认证安全

### 2.1 密码策略

```go
// 密码要求
const (
    MinPasswordLength = 8
    MaxPasswordLength = 64
)

func ValidatePassword(password string) error {
    if len(password) < MinPasswordLength {
        return errors.New("密码至少8位")
    }
    if len(password) > MaxPasswordLength {
        return errors.New("密码最多64位")
    }
    hasLetter := regexp.MustCompile(`[a-zA-Z]`).MatchString(password)
    hasDigit := regexp.MustCompile(`\d`).MatchString(password)
    if !hasLetter || !hasDigit {
        return errors.New("密码必须包含字母和数字")
    }
    return nil
}

// bcrypt哈希 (cost=12)
func HashPassword(password string) (string, error) {
    return bcrypt.GenerateFromPassword([]byte(password), 12)
}
```

### 2.2 JWT安全

```go
// Token配置
AccessTokenTTL  = 15 * time.Minute   // 短期
RefreshTokenTTL = 7 * 24 * time.Hour // 7天
SigningMethod    = jwt.SigningMethodHS256
SecretKeyLength  = 64 // bytes

// Token Claims
type Claims struct {
    UserID int64  `json:"uid"`
    Email  string `json:"email"`
    jwt.RegisteredClaims
}

// 安全要点:
// 1. Access Token 不存入数据库，无状态验证
// 2. Refresh Token 哈希后存Redis，支持主动失效
// 3. Token旋转: 每次刷新都颁发新的Refresh Token
// 4. 旧Refresh Token加入黑名单
// 5. Secret Key从环境变量读取，不硬编码
```

### 2.3 OAuth2安全

```go
// State参数防CSRF
func GenerateOAuthState() string {
    b := make([]byte, 32)
    rand.Read(b)
    state := base64.URLEncoding.EncodeToString(b)
    // 存Redis, TTL=10min
    redis.Set("oauth_state:"+state, "1", 10*time.Minute)
    return state
}

func ValidateOAuthState(state string) bool {
    exists := redis.Exists("oauth_state:" + state).Val()
    if exists > 0 {
        redis.Del("oauth_state:" + state) // 一次性使用
        return true
    }
    return false
}
```

### 2.4 登录安全

```go
// 登录失败限流
// 同一IP: 10次/15分钟
// 同一邮箱: 5次/15分钟
func CheckLoginRateLimit(ip, email string) error {
    ipKey := "login_fail:" + ip
    emailKey := "login_fail:" + email

    ipCount := redis.Incr(ipKey).Val()
    redis.Expire(ipKey, 15*time.Minute)

    emailCount := redis.Incr(emailKey).Val()
    redis.Expire(emailKey, 15*time.Minute)

    if ipCount > 10 || emailCount > 5 {
        return errors.New("登录尝试过多，请15分钟后重试")
    }
    return nil
}
```

## 三、数据安全

### 3.1 API Key加密存储

```go
// 使用AES-256-GCM加密用户的AI API Key
package crypto

import (
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "encoding/base64"
    "io"
)

var encryptionKey []byte // 从环境变量加载，32字节

func Encrypt(plaintext string) (string, error) {
    block, _ := aes.NewCipher(encryptionKey)
    gcm, _ := cipher.NewGCM(block)
    nonce := make([]byte, gcm.NonceSize())
    io.ReadFull(rand.Reader, nonce)
    ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
    return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func Decrypt(encoded string) (string, error) {
    ciphertext, _ := base64.StdEncoding.DecodeString(encoded)
    block, _ := aes.NewCipher(encryptionKey)
    gcm, _ := cipher.NewGCM(block)
    nonceSize := gcm.NonceSize()
    nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
    plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
    return string(plaintext), err
}
```

### 3.2 敏感数据处理

| 数据 | 存储方式 | 传输方式 |
|------|---------|---------|
| 密码 | bcrypt哈希 (不可逆) | HTTPS |
| AI API Key | AES-256-GCM加密 | HTTPS, 不返回给前端 |
| OAuth Token | AES加密或不存储 | HTTPS |
| JWT Secret | 环境变量 | 不传输 |
| DB密码 | 环境变量/.env | Docker内网 |

### 3.3 SQL注入防护

```go
// GORM参数化查询 (安全)
db.Where("email = ?", email).First(&user)

// 绝对禁止拼接SQL
// db.Where("email = '" + email + "'")  // 危险！
```

## 四、接口安全

### 4.1 限流配置

```go
// middleware/ratelimit.go
type RateLimitConfig struct {
    Global     Rate // 全局: 100次/秒/IP
    User       Rate // 用户: 200次/分钟
    AI         Rate // AI接口: 10次/分钟/用户
    Auth       Rate // 认证: 20次/分钟/IP
    Email      Rate // 邮件: 5次/小时/邮箱
}

// Redis令牌桶实现
func RateLimit(rdb *redis.Client, limit int, window time.Duration) gin.HandlerFunc {
    return func(c *gin.Context) {
        key := "rl:" + c.ClientIP()
        count := rdb.Incr(c, key).Val()
        if count == 1 {
            rdb.Expire(c, key, window)
        }
        if count > int64(limit) {
            c.Header("Retry-After", fmt.Sprintf("%d", int(window.Seconds())))
            response.TooManyRequests(c)
            c.Abort()
            return
        }
        c.Next()
    }
}
```

### 4.2 CORS配置

```go
func CORS(cfg *config.Config) gin.HandlerFunc {
    return cors.New(cors.Config{
        AllowOrigins: cfg.Server.CORSOrigins,
        // 生产: ["https://your-domain.com"]
        // 开发: ["http://localhost:3000"]
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    })
}
```

### 4.3 请求校验

```go
// 所有请求DTO都使用validator标签
type RegisterRequest struct {
    Email    string `json:"email" binding:"required,email,max=255"`
    Password string `json:"password" binding:"required,min=8,max=64"`
    Username string `json:"username" binding:"required,min=2,max=50"`
}

// 自定义校验: 检查危险字符
func SanitizeInput(input string) string {
    // 去除潜在XSS字符
    return bluemonday.StrictPolicy().Sanitize(input)
}
```

## 五、临时邮箱防护

```go
// internal/pkg/disposable/checker.go
type Checker struct {
    domains map[string]bool
    mu      sync.RWMutex
}

func NewChecker(filePath string) *Checker {
    c := &Checker{domains: make(map[string]bool)}
    // 从文件加载域名列表
    file, _ := os.Open(filePath)
    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        domain := strings.TrimSpace(scanner.Text())
        if domain != "" && !strings.HasPrefix(domain, "#") {
            c.domains[strings.ToLower(domain)] = true
        }
    }
    return c
}

func (c *Checker) IsDisposable(email string) bool {
    parts := strings.Split(email, "@")
    if len(parts) != 2 {
        return true // 格式不对直接拒绝
    }
    domain := strings.ToLower(parts[1])

    c.mu.RLock()
    defer c.mu.RUnlock()

    // 检查精确匹配
    if c.domains[domain] {
        return true
    }

    // 检查子域名 (如 xxx.tempmail.com)
    parts2 := strings.Split(domain, ".")
    for i := 1; i < len(parts2)-1; i++ {
        parent := strings.Join(parts2[i:], ".")
        if c.domains[parent] {
            return true
        }
    }

    return false
}
```

数据源: 维护一个 `data/disposable_domains.txt` 文件，包含 ~3000 个已知临时邮箱域名，定期更新。

## 六、HTTP安全头

```nginx
# Nginx层设置
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://connect.linux.do https://accounts.google.com https://github.com";
```

## 七、前端安全

### 7.1 XSS防护
- React默认转义所有输出 (dangerouslySetInnerHTML禁止使用)
- AI返回的内容用 `DOMPurify` 清理后再渲染
- CSP限制内联脚本

### 7.2 Token存储
- Access Token: 仅存内存 (Zustand store，不持久化)
- Refresh Token: httpOnly cookie (Web) / SecureStore (Mobile)
- 不使用 localStorage 存储任何token

### 7.3 敏感信息
- 前端不存储AI API Key（通过后端代理）
- 环境变量中仅暴露 `NEXT_PUBLIC_` 前缀的变量
- 构建产物中不包含敏感配置

## 八、安全审计清单

### 定期检查项

- [ ] 依赖包安全扫描 (`npm audit` / `go vuln check`)
- [ ] Docker镜像安全扫描 (`docker scout`)
- [ ] SSL证书有效期检查
- [ ] 数据库备份完整性验证
- [ ] 限流规则有效性测试
- [ ] OAuth2回调URL白名单检查
- [ ] 临时邮箱域名列表更新
- [ ] 日志中无敏感信息泄露
- [ ] CORS配置正确性
- [ ] HTTP安全头完整性

### 上线前必查

- [ ] 所有密钥使用环境变量，不硬编码
- [ ] JWT Secret至少64字符
- [ ] 数据库密码强度足够
- [ ] HTTPS已启用，HTTP重定向
- [ ] Debug模式已关闭
- [ ] 错误信息不暴露内部细节
- [ ] AI接口有并发限制
- [ ] 文件上传限制 (如有)
