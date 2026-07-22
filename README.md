# 与法贤聊

一款以「朋友圈」风格与先贤对话的移动应用。发布动态，AI 先贤会以各自独特的语气评论和互动，让古典智慧融入日常思考。

## 功能特性

- **发布动态** — 支持文字、图片、音乐、位置、标签
- **AI 先贤评论** — 发布动态后，随机一位先贤（苏格拉底、柏拉图、亚里士多德、西塞罗、乌尔比安等）自动生成评论
- **AI 先贤点赞** — 先贤自动为你的动态点赞
- **回复先贤** — 你可以回复先贤的评论，先贤会继续与你对话
- **每日先贤** — 每天自动推送一条先贤语录/动态
- **标签系统** — 支持为动态添加标签，可按标签筛选浏览
- **日历视图** — 按日期查看历史动态
- **全文搜索** — 按关键词搜索动态内容
- **图片预览** — 支持图片画廊浏览
- **音乐卡片** — 动态中展示音乐信息
- **个人主页** — 编辑昵称、头像等个人资料
- **评论点赞** — 为评论点赞
- **草稿自动保存** — 编辑中的动态自动保存为草稿
- **数据备份与恢复** — 支持导出/导入全部数据
- **跨平台** — 基于 Vue 3 + Capacitor，支持 Web 端和 Android 端

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API) |
| 构建工具 | Vite 5 |
| 移动端 | Capacitor 8 (Android) |
| AI 接口 | DeepSeek API |
| 数据存储 | localStorage + Capacitor Filesystem |
| 样式 | 纯 CSS |

## 项目结构

```
moments/
├── src/
│   ├── App.vue                    # 主应用组件
│   ├── main.js                    # 入口文件
│   ├── style.css                  # 全局样式
│   ├── components/                # Vue 组件
│   │   ├── AppHeader.vue          # 顶部导航
│   │   ├── ProfileHeader.vue      # 个人主页头部
│   │   ├── ProfileEditor.vue      # 个人资料编辑
│   │   ├── PostComposer.vue       # 动态发布编辑器
│   │   ├── PostCard.vue           # 动态卡片
│   │   ├── PostDetail.vue         # 动态详情页
│   │   ├── EditPostModal.vue      # 编辑动态弹窗
│   │   ├── CommentList.vue        # 评论列表
│   │   ├── LikeList.vue           # 点赞列表
│   │   ├── ImageGrid.vue          # 图片网格
│   │   ├── ImagePreviewModal.vue  # 图片预览弹窗
│   │   ├── MusicCard.vue          # 音乐卡片
│   │   ├── PhilosopherCard.vue    # 先贤介绍卡片
│   │   ├── CalendarView.vue       # 日历视图
│   │   ├── SearchBar.vue          # 搜索栏
│   │   └── SettingsModal.vue      # 设置弹窗
│   ├── composables/
│   │   └── useImageUrl.js         # 图片 URL 处理
│   ├── data/
│   │   └── philosophers.js        # 先贤数据（人物介绍、风格、系统提示词）
│   ├── services/
│   │   ├── postService.js         # 动态 CRUD 服务
│   │   ├── aiService.js           # AI 评论生成服务
│   │   ├── aiLikeService.js       # AI 点赞服务
│   │   ├── dailySageService.js    # 每日先贤服务
│   │   ├── dailyQuoteImportService.js  # 每日语录导入服务
│   │   ├── profileService.js      # 个人资料服务
│   │   ├── settingsService.js     # 设置管理服务
│   │   ├── storageService.js      # 本地存储服务
│   │   ├── fileStorageService.js  # 文件存储服务（原生端）
│   │   ├── backupService.js       # 数据备份恢复服务
│   │   ├── draftService.js        # 草稿服务
│   │   ├── imageService.js        # 图片处理服务
│   │   └── migrateService.js      # 数据迁移服务
│   └── utils/
│       ├── time.js                # 时间工具函数
│       └── search.js              # 搜索工具函数
├── android/                       # Android 原生项目（Capacitor）
├── package.json
└── vite.config.js
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式（Web 端）

```bash
npm run dev
```

浏览器访问 `http://localhost:5173` 即可预览。

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

### Android 端运行

1. 确保已安装 Android Studio 和 Android SDK
2. 构建 Web 资源：

```bash
npm run build
```

3. 同步并运行 Android 项目：

```bash
npx cap sync android
npx cap open android
```

在 Android Studio 中编译运行即可。

## 使用指南

### 1. 配置 API Key

在使用 AI 先贤评论功能前，需要在设置中配置 DeepSeek API Key：

1. 打开应用，点击设置图标
2. 在"AI 评论设置"中填入你的 DeepSeek API Key
3. 开启"启用先贤评论"开关

### 2. 发布动态

1. 点击首页的发布按钮
2. 输入文字内容，可添加图片、音乐、位置和标签
3. 点击发布按钮

### 3. 与先贤互动

- 发布动态后，系统会自动随机选择一位先贤为你的动态生成评论
- 先贤也会自动为你点赞
- 你可以点击先贤评论下的回复按钮，与先贤对话
- 点击先贤头像可以查看该先贤的详细介绍

### 4. 评论风格设置

在设置中可以选择先贤评论的语气风格：

- **温和** — 像长者劝导，耐心克制
- **严肃** — 强调原则、责任、秩序
- **犀利** — 直接有锋芒，指出矛盾
- **诗意** — 有文采、比喻感和哲思感
- **法理化** — 围绕权利、义务、正义、秩序展开

### 5. 数据备份

在设置中可以使用数据备份与恢复功能，导出全部数据为 JSON 文件，或从 JSON 文件恢复数据。

## 内置先贤

| 先贤 | 时期 | 风格 |
|------|------|------|
| 苏格拉底 | 古希腊 | 诘问、反讽，用提问引导反思 |
| 柏拉图 | 古希腊 | 庄重思辨，探讨正义与理念 |
| 亚里士多德 | 古希腊 | 理性系统，分析原因与目的 |
| 西塞罗 | 古罗马 | 雄辩庄重，强调法律与责任 |
| 乌尔比安 | 古罗马 | 简洁凝练，法学格言风格 |
| 更多先贤… | | |

## License

Private
```
