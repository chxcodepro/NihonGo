# 国际化 (i18n) 指南

## 一、支持语言

| 代码 | 语言 | 状态 | 用途 |
|------|------|------|------|
| zh-CN | 简体中文 | 主语言 | 默认语言 |
| en | English | 完整支持 | 国际用户 |
| ja | 日本語 | 完整支持 | 学习目标语言 |

## 二、技术方案

| 端 | 方案 | 说明 |
|---|---|---|
| Web (Next.js) | next-intl | 支持RSC，URL路由前缀 |
| Mobile (Expo) | i18n-js + expo-localization | 轻量，系统语言检测 |
| Desktop (Tauri) | 复用Web方案 | |

## 三、文件结构

```
packages/i18n/
├── locales/
│   ├── zh-CN/
│   │   ├── common.json         # 通用文案
│   │   ├── auth.json           # 认证相关
│   │   ├── learn.json          # 学习模块
│   │   ├── typing.json         # 打字模块
│   │   ├── game.json           # 游戏模块
│   │   ├── ai.json             # AI对话
│   │   ├── settings.json       # 设置页
│   │   └── version.json        # 版本更新
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   └── ...
│   └── ja/
│       ├── common.json
│       ├── auth.json
│       └── ...
├── index.ts                    # 导出接口
└── types.ts                    # 类型定义
```

## 四、翻译文件示例

### 4.1 common.json

```json
// zh-CN/common.json
{
    "app_name": "NihonGo",
    "nav": {
        "home": "首页",
        "learn": "学习",
        "typing": "打字练习",
        "games": "小游戏",
        "ai_chat": "AI对话",
        "settings": "设置",
        "profile": "个人中心"
    },
    "auth": {
        "login": "登录",
        "register": "注册",
        "logout": "退出登录",
        "login_required": "请先登录"
    },
    "theme": {
        "light": "亮色",
        "dark": "暗色",
        "system": "跟随系统"
    },
    "language": {
        "zh-CN": "简体中文",
        "en": "English",
        "ja": "日本語"
    },
    "actions": {
        "confirm": "确认",
        "cancel": "取消",
        "save": "保存",
        "delete": "删除",
        "back": "返回",
        "next": "下一步",
        "retry": "重试",
        "loading": "加载中...",
        "submitting": "提交中..."
    },
    "status": {
        "success": "操作成功",
        "error": "操作失败",
        "network_error": "网络错误，请检查连接"
    }
}
```

```json
// en/common.json
{
    "app_name": "NihonGo",
    "nav": {
        "home": "Home",
        "learn": "Learn",
        "typing": "Typing",
        "games": "Games",
        "ai_chat": "AI Chat",
        "settings": "Settings",
        "profile": "Profile"
    },
    "auth": {
        "login": "Log in",
        "register": "Sign up",
        "logout": "Log out",
        "login_required": "Please log in first"
    },
    "theme": {
        "light": "Light",
        "dark": "Dark",
        "system": "System"
    },
    "actions": {
        "confirm": "Confirm",
        "cancel": "Cancel",
        "save": "Save",
        "delete": "Delete",
        "back": "Back",
        "next": "Next",
        "retry": "Retry",
        "loading": "Loading...",
        "submitting": "Submitting..."
    }
}
```

### 4.2 learn.json

```json
// zh-CN/learn.json
{
    "kana": {
        "title": "五十音图",
        "hiragana": "平假名",
        "katakana": "片假名",
        "all": "全部",
        "gojuon": "清音",
        "dakuon": "浊音",
        "handakuon": "半浊音",
        "youon": "拗音",
        "romaji": "罗马音",
        "stroke_order": "笔顺",
        "play_sound": "播放发音",
        "quiz": {
            "title": "假名测验",
            "see_kana_type_romaji": "看假名打罗马音",
            "hear_sound_select_kana": "听音选假名",
            "correct": "正确！",
            "incorrect": "错误，正确答案是 {answer}"
        }
    },
    "vocabulary": {
        "title": "词汇学习",
        "level": "JLPT {level}",
        "word": "单词",
        "reading": "读音",
        "meaning": "释义",
        "example": "例句",
        "conjugation": "变形",
        "flip_card": "点击翻转",
        "learned": "已学 {count} 个",
        "total": "共 {total} 个"
    },
    "grammar": {
        "title": "语法学习",
        "pattern": "句型",
        "explanation": "解释",
        "examples": "例句",
        "notes": "注意事项",
        "practice": "练习"
    },
    "progress": {
        "title": "学习进度",
        "today": "今日学习",
        "streak": "连续 {days} 天",
        "review_due": "{count} 项待复习",
        "mastered": "已掌握",
        "learning": "学习中",
        "new": "未学习"
    },
    "srs": {
        "easy": "简单",
        "good": "一般",
        "hard": "困难",
        "again": "忘了",
        "next_review": "下次复习: {time}"
    }
}
```

### 4.3 game.json

```json
// zh-CN/game.json
{
    "typing_race": {
        "title": "打字竞速",
        "description": "和AI比谁打得快！",
        "difficulty": {
            "easy": "初学者",
            "normal": "中级",
            "hard": "高手"
        },
        "ai_speed": "AI速度: {speed} 字符/分钟",
        "countdown": "准备...",
        "go": "开始！",
        "result": {
            "win": "你赢了！",
            "lose": "AI更快一步，继续加油！",
            "tie": "平局！旗鼓相当！"
        },
        "stats": {
            "your_wpm": "你的速度",
            "ai_wpm": "AI速度",
            "accuracy": "正确率",
            "time": "用时"
        },
        "play_again": "再来一局",
        "change_difficulty": "换难度"
    },
    "sokoban": {
        "title": "推箱子记语法",
        "description": "推动语法成分到正确位置！",
        "level": "关卡 {current}/{total}",
        "target_sentence": "目标句子",
        "moves": "步数: {current}/{min}",
        "undo": "撤销",
        "reset": "重置",
        "hint": "提示",
        "stars": {
            "three": "完美！最少步数通关！",
            "two": "很好！还能更优化",
            "one": "通关了！试试用更少步数"
        },
        "next_level": "下一关",
        "replay": "重玩",
        "completed": "恭喜通关！你掌握了「{grammar}」的用法"
    }
}
```

### 4.4 version.json

```json
// zh-CN/version.json
{
    "update": {
        "check": "检查更新",
        "checking": "检查中...",
        "available": "发现新版本 v{version}",
        "up_to_date": "已是最新版本",
        "changelog": "更新内容",
        "download": "下载更新",
        "downloading": "下载中... {percent}%",
        "install": "安装更新",
        "install_restart": "安装并重启",
        "later": "稍后更新",
        "force_update": "此版本需要强制更新才能继续使用",
        "failed": "更新失败，请稍后重试"
    },
    "current_version": "当前版本: v{version}"
}
```

## 五、Next.js 集成

### 5.1 配置

```typescript
// apps/web/i18n.ts
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
    messages: {
        ...(await import(`@repo/i18n/locales/${locale}/common.json`)).default,
        ...(await import(`@repo/i18n/locales/${locale}/learn.json`)).default,
        ...(await import(`@repo/i18n/locales/${locale}/game.json`)).default,
        ...(await import(`@repo/i18n/locales/${locale}/auth.json`)).default,
        ...(await import(`@repo/i18n/locales/${locale}/settings.json`)).default,
        ...(await import(`@repo/i18n/locales/${locale}/version.json`)).default,
    },
}))
```

### 5.2 使用

```tsx
// 在组件中使用
import { useTranslations } from 'next-intl'

export function KanaPage() {
    const t = useTranslations('kana')

    return (
        <div>
            <h1>{t('title')}</h1>
            <p>{t('quiz.see_kana_type_romaji')}</p>
        </div>
    )
}

// 带变量
export function ProgressBar({ count, total }: Props) {
    const t = useTranslations('vocabulary')
    return <span>{t('learned', { count })}</span>
    // 输出: "已学 50 个"
}
```

## 六、翻译工作流

### 6.1 新增文案流程

```
1. 在 zh-CN/*.json 中添加中文key
2. 在 en/*.json 中添加英文翻译
3. 在 ja/*.json 中添加日文翻译
4. 运行 pnpm i18n:check 检查缺失的key
5. TypeScript类型自动推导，缺失key会报编译错误
```

### 6.2 质量检查

```bash
# 检查所有语言文件key是否一致
pnpm i18n:check

# 检查是否有未使用的key
pnpm i18n:unused

# 导出待翻译的key (给翻译人员)
pnpm i18n:export --lang ja --missing
```

## 七、注意事项

1. **Key命名**: 使用点分层级，如 `learn.kana.title`
2. **变量**: 使用 `{variable}` 语法
3. **复数**: 使用ICU MessageFormat `{count, plural, one {# item} other {# items}}`
4. **不翻译的内容**: 品牌名NihonGo、日语原文保持不变
5. **RTL**: 暂不支持，无RTL语言
6. **日期/数字**: 使用 `Intl.DateTimeFormat` / `Intl.NumberFormat` 本地化
