# Fuelog 🔥 健身饮食追踪 / Fitness & Diet Tracker

> 一个移动端优先的响应式 Web App，融合 **健身训练管理** 与 **AI 饮食记录**。
> A mobile-first responsive web app combining **fitness training management** and **AI-powered diet logging**.

---

## ✨ 功能亮点 / Features

| 模块 / Module | 功能说明 / Description |
|------|------|
| 📸 **AI 拍照识别** / AI Photo Recognition | 拍照 / 相册选图 → 视觉大模型识别食物名称、卡路里、6 项营养素 + AI 小贴士。Recognize food from camera/gallery, returns name, calories, 6 nutrients + AI tips. |
| 🍳 **选食材做菜** / Ingredient-to-Recipe | 选冰箱里的食材 + 厨具 + 口味 → AI 推荐可做的菜谱（含热量 / 时间 / 难度 / 步骤）。Pick ingredients & cookware, AI recommends recipes with calories/time/difficulty/steps. |
| 📓 **饮食日记** / Food Diary | 按日期记录每餐（早 / 午 / 晚 / 加餐），食物贴纸卡片网格 + 当日摄入统计。Log meals by date with sticker-style food cards and daily intake stats. |
| 📅 **日历视图** / Calendar View | 周视图日期切换，有记录的日期带圆点标记。Weekly date switcher with dot markers on logged days. |
| 🍽️ **健康食谱** / Recipes | 杂志风卡片墙，搜索 + 分类筛选，收藏自定义食谱。Magazine-style card wall with search, category filters, and favorites. |
| 💪 **训练计划** / Training Plans | 本周消耗柱状图（Recharts）+ 训练任务管理、完成打卡。Weekly burn bar chart + training task management & completion. |
| 💧 **习惯追踪** / Habit Tracking | 饮水（+250/500/750ml）+ 运动时长记录，快捷弹窗交互。Water intake & exercise minutes with quick-action sheets. |
| 🎯 **目标设置** / Goal Settings | 卡路里 / 碳水 / 蛋白质 / 脂肪 / 饮水 / 运动目标可配置。Configurable calorie/macro/water/exercise goals. |
| ☁️ **云同步** / Cloud Sync | Supabase 用户登录 + 多设备同步，localStorage 离线缓存兜底。Supabase auth, multi-device sync with localStorage offline fallback. |
| 💾 **本地持久化** / Local Persistence | 所有数据本地存储（`fuelog_` 前缀），刷新不丢失。All data persisted locally, survives refresh. |
| 🌐 **PWA 部署** / Deployment | HashRouter + GitHub Pages，微信浏览器可直接访问。Works on WeChat browser via GitHub Pages. |

---

## 🛠️ 技术栈 / Tech Stack

- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS 3** — 布局 / 色彩 / 动画（Layout, colors, animations）
- **Framer Motion 11** — 页面转场与微交互动画（Page transitions & micro-interactions）
- **Recharts 2** — 训练消耗柱状图（Workout burn bar chart）
- **React Router v6**（HashRouter，兼容 GitHub Pages 与微信）
- **@iconify/icons-solar** — Solar 图标集（Solar icon set）
- **@supabase/supabase-js** — 云数据库 / 认证（Cloud DB & auth）
- **Kimi / DeepSeek API** — AI 视觉识别与菜谱生成（Vision & recipe generation）

---

## 🚀 快速开始 / Quick Start

### 环境要求 / Requirements

- Node.js ≥ 18

### 安装与运行 / Install & Run

```bash
# 克隆项目 / Clone
git clone git@github.com:clanzhang/Fuelog.git
cd Fuelog

# 安装依赖 / Install dependencies
npm install

# 启动开发服务器 / Start dev server（默认 http://localhost:5173）
npm run dev

# 生产构建 / Production build
npm run build

# 本地预览生产构建 / Preview production build
npm run preview
```

---

## 🔑 环境变量配置 / Environment Variables

在项目根目录创建 `.env` 文件（参考 `.env.example`）。

Create a `.env` file at the project root (see `.env.example`):

```bash
# AI 拍照识别（Kimi 视觉模型）/ AI photo recognition (Kimi vision)
VITE_DEEPSEEK_API_KEY=your_key_here

# AI 菜谱推荐（DeepSeek）/ AI recipe recommendation (DeepSeek)
VITE_DEEPSEEK_RECIPE_API_KEY=your_key_here

# Supabase 云同步（可选，留空则仅本地存储）/ Cloud sync (optional)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ `.env` 已被 `.gitignore` 忽略，密钥不会提交到仓库。
> `.env` is gitignored; keys are never committed.

---

## ☁️ Supabase 云同步 / Cloud Sync

将 localStorage 数据升级为 Supabase 云数据库，实现**用户登录 + 多设备同步**。
Upgrade localStorage to Supabase for **user login + multi-device sync**.

### 配置步骤 / Setup

1. 在 [supabase.com](https://supabase.com) 创建免费项目（Create a free project）
2. 在 **SQL Editor** 全选执行 `supabase/schema.sql`（建表 + RLS 安全策略）。Run the full `supabase/schema.sql` in the SQL Editor (tables + RLS policies).
3. 在 **Settings → API** 复制 URL 和 anon key，填入 `.env`。Copy URL & anon key from Settings → API into `.env`.
4. 在 **Authentication → Providers → Email** 开启邮箱登录。Enable email provider in Authentication → Providers → Email.

### 登录方式 / Login

- **邮箱验证码一键登录**（OTP）：输入邮箱 → 收到验证码 → 输入即登录，首次登录自动创建账号，无需密码。
- **Email OTP login**: enter email → receive code → enter code to log in. First login auto-creates the account; no password needed.

### 工作原理 / How It Works

- 未配置 / 未登录：数据只存 localStorage，正常使用。No config / not logged in: data stays in localStorage.
- 已登录：每次操作同时写 localStorage + Supabase。Logged in: writes go to both localStorage and Supabase.
- 读取：优先读 Supabase，失败时 fallback 到 localStorage。Reads prefer Supabase, falling back to localStorage.
- 首次登录自动把本地旧数据迁移到云端。First login auto-migrates local data to the cloud.
- 图片（base64）不上传云端，只存文字数据。Images (base64) stay local; only text data is synced.

---

## 📁 项目结构 / Project Structure

```
Fuelog/
├── index.html            # 入口 HTML（含主题 CSS 变量）
├── vite.config.ts        # Vite 配置（base '/Fuelog/'）
├── tailwind.config.js    # Tailwind 主题（primary #3942DE 等）
├── supabase/
│   └── schema.sql        # Supabase 建表脚本（含 RLS 策略）
├── src/
│   ├── main.tsx          # 入口（HashRouter + DataProvider）
│   ├── App.tsx           # 路由 + 全局 ActionSheet + 登录守卫
│   ├── types.ts          # 类型定义 + 常量
│   ├── components/       # SolarIcon / BottomTabBar / Page / ProgressRing ...
│   ├── context/          # DataContext（数据源 + 云同步）
│   ├── pages/            # Today / Diary / Recipes / Trainers / Profile / ...
│   └── utils/            # ai / recipes / supabase / cloud / storage / image ...
```

---

## 🧭 页面路由 / Routes

| 路由 / Route | 页面 / Page | 说明 / Description |
|------|------|------|
| `/today` | 今日概览 Today | 摄入环、营养素、饮水运动、训练计划 |
| `/diary` | 饮食日记 Diary | 周视图 + 贴纸网格 + 摄入统计 |
| `/recipes` | 健康食谱 Recipes | 食材选菜入口 + 收藏卡片墙 |
| `/trainers` | 训练计划 Trainers | 周柱状图 + 训练列表 |
| `/profile` | 个人中心 Profile | 统计 + 目标设置 + 云同步 + 退出 |
| `/food/:id` | 食物详情 Food Detail | AI Tips + 营养素 |
| `/recognize` | AI 识别 Recognize | 拍照/相册 → 分析 → 结果 |
| `/ingredient-pick` | 选食材 Ingredient Pick | 食材/厨具/口味选择 |
| `/recipe-result` | 菜谱结果 Recipe Result | AI 生成菜谱卡片 |

---

## 🚢 部署到 GitHub Pages / Deploy to GitHub Pages

项目已配置 `gh-pages` 部署：

```bash
# 一键构建并部署到 gh-pages 分支 / Build & deploy to gh-pages
npm run deploy

# 访问地址 / Live URL
# https://clanzhang.github.io/Fuelog/
```

---

## ⚠️ 使用说明 / Notes

- 本仓库为**个人项目**，仅供学习与自用。This is a **personal project** for learning and personal use.
- AI 功能需自行申请并配置对应 API Key（DeepSeek / Supabase）。AI features require your own API keys.
- 所有数据默认仅存本地，配置 Supabase 后可实现云端备份。Data is local by default; configure Supabase for cloud backup.

