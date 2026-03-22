# 版本更新策略

## 一、版本号规范

采用 **Semantic Versioning** (语义化版本):

```
MAJOR.MINOR.PATCH
  │      │     │
  │      │     └── 修复bug，无新功能
  │      └──────── 新功能，向后兼容
  └─────────────── 重大变更，可能不兼容
```

示例:
- `1.0.0` → 首次发布
- `1.1.0` → 添加推箱子游戏
- `1.1.1` → 修复TTS不出声的bug
- `2.0.0` → 重构数据库结构（不兼容旧版）

## 二、各平台更新策略

### 2.1 Web端

| 项目 | 说明 |
|------|------|
| 更新方式 | 重新部署即完成更新 |
| 用户感知 | 刷新页面自动加载新版 |
| 回滚 | Docker回滚到上一个镜像 |
| 缓存 | Next.js内置缓存失效策略 |

**无需额外更新逻辑**，部署即更新。

### 2.2 桌面端 (Tauri: Windows / macOS / Linux)

使用 `tauri-plugin-updater`，基于 GitHub Releases。

支持平台建议：

- Windows：MSI
- macOS：DMG / App Bundle
- Linux：AppImage / deb

#### 更新流程

```
应用启动
  │
  ├── 后台检查更新 (静默)
  │   GET /api/version/check?platform=windows&current=1.0.0
  │
  ├── 有新版本?
  │   ├── 否 → 正常使用
  │   └── 是 → 显示更新提示
  │           │
  │           ├── 非强制更新 → 用户选择 [立即更新] / [稍后提醒]
  │           └── 强制更新 → 必须更新才能继续使用
  │
  ├── 用户点击更新
  │   ├── 下载更新包 (显示进度条)
  │   ├── 校验签名
  │   ├── 安装更新
  │   └── 重启应用
  │
  └── 设置页手动检查
      [检查更新] 按钮
```

#### Tauri 配置

```json
// src-tauri/tauri.conf.json
{
    "plugins": {
        "updater": {
            "active": true,
            "dialog": false,
            "endpoints": [
                "https://your-domain.com/api/version/tauri/{target}/{arch}/{current_version}"
            ],
            "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6...",
            "windows": {
                "installMode": "passive"
            }
        }
    }
}
```

#### Tauri 更新端点响应格式

```json
// GET /api/version/tauri/windows/x86_64/1.0.0
// 有更新时返回:
{
    "version": "1.1.0",
    "notes": "## v1.1.0\n- 新增推箱子游戏\n- 优化TTS延迟",
    "pub_date": "2024-02-01 08:00:00 UTC+8",
    "platforms": {
        "windows-x86_64": {
            "signature": "dW50cnVzdGVk...",
            "url": "https://github.com/.../releases/download/v1.1.0/nihongo_1.1.0_x64-setup.msi.zip"
        }
    }
}

// 无更新时返回: 204 No Content
```

#### 前端更新组件

```tsx
// apps/desktop/components/UpdateChecker.tsx
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

export function UpdateChecker() {
    const [update, setUpdate] = useState<Update | null>(null)
    const [progress, setProgress] = useState(0)
    const t = useTranslations('version.update')

    useEffect(() => {
        // 启动时静默检查
        checkForUpdate()
    }, [])

    async function checkForUpdate() {
        const update = await check()
        if (update?.available) {
            setUpdate(update)
        }
    }

    async function installUpdate() {
        if (!update) return
        await update.downloadAndInstall((event) => {
            if (event.event === 'Progress') {
                setProgress(Math.round(
                    (event.data.chunkLength / event.data.contentLength) * 100
                ))
            }
        })
        await relaunch()
    }

    if (!update) return null

    return (
        <Dialog>
            <DialogContent>
                <h2>{t('available', { version: update.version })}</h2>
                <div className="prose">{update.body}</div>
                {progress > 0 ? (
                    <Progress value={progress} />
                ) : (
                    <div className="flex gap-2">
                        <Button onClick={installUpdate}>{t('download')}</Button>
                        <Button variant="ghost" onClick={() => setUpdate(null)}>
                            {t('later')}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
```

### 2.3 移动端 (Expo: Android / iOS)

#### 更新方式

| 方式 | 适用场景 | 说明 |
|------|---------|------|
| EAS Update | JS代码/资源变更 | 应用内检查并下载更新 |
| 原生版本更新 | 原生代码变更 | Android 跳下载页/商店，iOS 走 App Store / TestFlight |

#### 版本检查流程

```
应用启动
  │
  ├── 检查 EAS Update
  │   ├── 有JS更新 → 应用内下载 → 提示重启或下次启动生效
  │   └── 无更新 → 继续
  │
  ├── 检查原生版本更新
  │   GET /api/version/check?platform=android&current=1.0.0
  │   ├── 有更新 → 弹窗提示
  │   │   ├── Android → 跳下载页或商店
  │   │   └── iOS → 跳 App Store / TestFlight
  │   └── 无更新 → 正常使用
```

> 说明：
> - 移动端“软件内更新”优先指 **EAS Update** 这类应用内热更新
> - iOS 原生二进制更新不能像桌面端那样直接在应用内下载安装替换自身，仍需走 App Store / TestFlight 分发链路

#### 实现代码

```tsx
// apps/mobile/hooks/useVersionCheck.ts
import * as Updates from 'expo-updates'
import { Linking } from 'react-native'
import { apiClient } from '@repo/shared/api'
import Constants from 'expo-constants'

export function useVersionCheck() {
    const checkUpdate = async () => {
        // 1. 检查 EAS Update
        if (!__DEV__) {
            const update = await Updates.checkForUpdateAsync()
            if (update.isAvailable) {
                await Updates.fetchUpdateAsync()
                // 可提示用户立即重启或下次启动生效
            }
        }

        // 2. 检查原生版本更新
        const currentVersion = Constants.expoConfig?.version || '0.0.0'
        const { data } = await apiClient('/version/check', {
            query: { platform: 'android', current_version: currentVersion }
        })

        if (data.has_update) {
            return {
                hasUpdate: true,
                version: data.latest_version,
                changelog: data.changelog,
                downloadUrl: data.download_url,
                forceUpdate: data.force_update,
            }
        }
        return { hasUpdate: false }
    }

    const openDownload = (url: string) => {
        Linking.openURL(url)
    }

    return { checkUpdate, openDownload }
}
```

## 三、版本API

### 3.1 后端实现

```go
// internal/handler/version_handler.go
func (h *VersionHandler) CheckUpdate(c *gin.Context) {
    platform := c.Query("platform")
    currentVersion := c.Query("current_version")

    latest, err := h.versionService.GetLatest(c, platform)
    if err != nil || latest == nil {
        response.OK(c, gin.H{"has_update": false})
        return
    }

    hasUpdate := compareVersions(currentVersion, latest.Version) < 0

    response.OK(c, gin.H{
        "has_update":      hasUpdate,
        "latest_version":  latest.Version,
        "version_code":    latest.VersionCode,
        "download_url":    latest.DownloadURL,
        "changelog":       getLocalizedChangelog(latest, c),
        "force_update":    latest.ForceUpdate,
        "min_version":     latest.MinVersion,
        "published_at":    latest.PublishedAt,
    })
}

// Tauri专用端点
func (h *VersionHandler) TauriUpdate(c *gin.Context) {
    target := c.Param("target")     // windows-x86_64
    currentVersion := c.Param("current_version")

    latest, _ := h.versionService.GetLatest(c, "windows")
    if latest == nil || compareVersions(currentVersion, latest.Version) >= 0 {
        c.Status(204) // No Content = 无更新
        return
    }

    c.JSON(200, gin.H{
        "version":  latest.Version,
        "notes":    latest.ChangelogEn,
        "pub_date": latest.PublishedAt,
        "platforms": gin.H{
            target: gin.H{
                "signature": latest.Signature,
                "url":       latest.DownloadURL,
            },
        },
    })
}
```

## 四、发版流程

### 4.1 发版清单

```
1. 更新版本号
   ├── package.json (所有workspace)
   ├── server/config.yaml
   ├── apps/desktop/src-tauri/tauri.conf.json
   └── apps/mobile/app.json

2. 编写CHANGELOG
   ├── 中文
   ├── 英文
   └── 日文

3. 数据库插入版本记录
   INSERT INTO app_versions (platform, version, ...)

4. Git操作
   ├── git commit -m "release: v1.1.0"
   ├── git tag v1.1.0
   └── git push origin main --tags

5. CI/CD自动触发
   ├── GitHub Actions 构建并推送 web / server 镜像到 GHCR
   ├── GitHub Actions 自动 SSH 到云端执行更新脚本
   ├── GitHub Actions 构建桌面端安装包并上传到 GitHub Releases
   ├── GitHub Actions / EAS 构建 Android / iOS 原生包
   └── EAS Update 发布热更新内容（如适用）

6. 验证
   ├── Web访问正常
   ├── 桌面端检测到更新
   ├── 移动端检测到更新
   └── API /health 返回新版本号
```

### 4.2 版本号自动同步脚本

```bash
#!/bin/bash
# scripts/bump-version.sh
VERSION=$1

# 更新所有package.json
jq ".version = \"$VERSION\"" package.json > tmp.json && mv tmp.json package.json
jq ".version = \"$VERSION\"" apps/web/package.json > tmp.json && mv tmp.json apps/web/package.json
jq ".version = \"$VERSION\"" apps/mobile/package.json > tmp.json && mv tmp.json apps/mobile/package.json

# 更新Tauri
jq ".version = \"$VERSION\"" apps/desktop/src-tauri/tauri.conf.json > tmp.json && mv tmp.json apps/desktop/src-tauri/tauri.conf.json

# 更新Expo
jq ".expo.version = \"$VERSION\"" apps/mobile/app.json > tmp.json && mv tmp.json apps/mobile/app.json

echo "版本已更新到 $VERSION"
```

## 五、回滚策略

| 平台 | 回滚方式 |
|------|---------|
| Web | 拉取上一个稳定 tag 镜像并重新 `docker compose up -d` |
| Desktop | GitHub Releases保留历史版本，用户可手动下载 |
| Mobile Update | EAS Update 可回滚到上一个 update group |
| Mobile Native | Android 重新发布包；iOS 通过 TestFlight / App Store 发 hotfix |
| 数据库 | `migrate down` 回退迁移 |
