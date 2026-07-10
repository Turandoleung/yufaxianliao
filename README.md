# 与法贤聊

一款以「朋友圈」风格与先贤对话的移动应用。发布动态，AI 先贤会以各自独特的语气评论和互动，让古典智慧融入日常思考。

## ✨ 功能特性

### 📱 社交动态
- 发布文字动态、图文动态
- 音乐卡片分享
- 手动添加地址标记
- 动态标签（#法理 #读书 #生活 等，最多 5 个）
- 编辑 / 删除动态
- 草稿箱自动保存

### 🏛️ 每日先贤
- 每日自动推送一位先贤的智慧箴言
- 支持三种模式：本地法谚、导入法谚库、DeepSeek 实时生成
- 先贤动态可点赞、评论、删除
- 导入 JSON 法谚库，支持自定义标签

### 🤖 AI 先贤互动
- 10 位先贤以各自风格评论你的动态
- 支持回复先贤，展开多轮对话（最多 3 轮）
- 先贤点赞动态（金色名字标识）
- 点击先贤名字查看资料卡

### 💬 评论与点赞
- 普通评论与 AI 先贤评论共存
- 完整点赞人列表
- 动态详情页集中查看评论和回复

### 🔍 搜索与筛选
- 全文搜索：动态正文、评论、先贤名、标签、地址、音乐
- 标签筛选：点击标签快速过滤
- 日历视图：按日期查看动态，支持年份/月份快速跳转
- 时间快捷筛选：全部 / 今天 / 昨天 / 本周 / 本月
- 多维度筛选可叠加（搜索 + 标签 + 日期）

### 👤 个人资料
- 自定义头像和背景图
- 昵称和个性签名
- 资料编辑保存

### 💾 数据管理
- 所有数据本地存储（localStorage）
- 导出备份为 JSON 文件
- 从 JSON 文件导入恢复
- 默认不导出 DeepSeek API Key

## 🏛️ 内置先贤

| 先贤 | 时代 | 核心思想 |
|------|------|---------|
| 苏格拉底 | 古希腊 | 未经审视的人生不值得过 |
| 柏拉图 | 古希腊 | 现实是理念世界的影子 |
| 亚里士多德 | 古希腊 | 德性在于中道 |
| 西塞罗 | 古罗马 | 自然法是正义的根基 |
| 乌尔比安 | 古罗马 | 正义是给予每人其所应得 |
| 阿奎那 | 中世纪 | 理性与信仰的和谐 |
| 霍布斯 | 近代 | 利维坦与社会契约 |
| 洛克 | 近代 | 生命、自由、财产 |
| 孟德斯鸠 | 启蒙时代 | 三权分立 |
| 韩非子 | 中国先秦 | 法、术、势 |

## 🛠️ 技术栈

- **前端框架**：Vue 3（Composition API）
- **构建工具**：Vite 5
- **移动端**：Capacitor 8（Android）
- **AI 评论**：DeepSeek API
- **数据存储**：localStorage
- **无第三方 UI 库**，全部手写组件

## 📁 项目结构

```
src/
├── App.vue                    # 主应用（状态管理、事件协调）
├── main.js                    # 入口
├── style.css                  # 全局样式
├── components/
│   ├── AppHeader.vue          # 顶部标题栏
│   ├── ProfileHeader.vue     # 封面图 + 个人资料 + 工具按钮
│   ├── PostCard.vue          # 动态卡片
│   ├── PostDetail.vue        # 动态详情页
│   ├── PostComposer.vue      # 发布动态弹窗
│   ├── EditPostModal.vue     # 编辑动态弹窗
│   ├── CalendarView.vue      # 日历网格视图
│   ├── SearchBar.vue         # 搜索框
│   ├── ImageGrid.vue         # 图片九宫格
│   ├── ImagePreviewModal.vue # 图片预览
│   ├── MusicCard.vue         # 音乐卡片
│   ├── LikeList.vue          # 点赞人列表
│   ├── CommentList.vue       # 评论区
│   ├── PhilosopherCard.vue   # 先贤资料卡
│   ├── ProfileEditor.vue     # 资料编辑
│   └── SettingsModal.vue     # 设置弹窗
├── services/
│   ├── postService.js        # 动态 CRUD
│   ├── aiService.js          # DeepSeek AI 评论
│   ├── aiLikeService.js      # AI 先贤点赞
│   ├── dailySageService.js   # 每日先贤生成
│   ├── dailyQuoteImportService.js  # 法谚库导入
│   ├── draftService.js       # 草稿箱
│   ├── profileService.js     # 用户资料
│   ├── settingsService.js    # 设置管理
│   ├── imageService.js       # 图片处理
│   └── backupService.js      # 数据备份与恢复
├── data/
│   └── philosophers.js       # 10 位先贤数据
└── utils/
    ├── time.js               # 时间格式化与日历工具
    └── search.js             # 搜索匹配工具
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Android Studio（如需构建 Android）

### 安装与运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

### Android 构建

```bash
# 构建 Web 资源
npm run build

# 同步到 Android 项目
npx cap sync android

# 在 Android Studio 中打开
npx cap open android
```

然后在 Android Studio 中点击 Run 安装到手机。

## ⚙️ 配置

### DeepSeek API Key

在应用内「设置」页面填入 DeepSeek API Key，即可启用 AI 先贤评论功能。

- 没有 API Key 时，应用仍可正常使用（动态发布、标签、搜索、日历等）
- API Key 仅存储在本地，不会上传到任何服务器
- 导出备份时默认不包含 API Key

### 法谚库导入

支持导入 JSON 格式的法谚库，格式示例：

```json
[
  {
    "quote": "正义是给予每个人其所应得的恒常而坚定的意愿。",
    "philosopherName": "乌尔比安",
    "explanation": "罗马法中对正义的经典定义。",
    "tags": ["罗马法", "正义"]
  }
]
```

## 📄 备份文件格式

导出的备份文件为 JSON，结构如下：

```json
{
  "appName": "与法贤聊",
  "version": 1,
  "exportedAt": 1720600000000,
  "data": {
    "profile": {},
    "posts": [],
    "settings": {},
    "draft": {},
    "dailySagePool": [],
    "importedDailyQuotes": []
  }
}
```

## 📜 许可

个人项目，仅供学习交流。
```
```
