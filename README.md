# Fuelog 🔥 健身饮食追踪

> 一个移动端优先的响应式 Web App，融合 **健身训练管理** 与 **AI 饮食记录**。
>
> 📄 查看英文版 / [English README](README.en.md)

---

## ✨ 功能亮点

- 📸 **AI 拍照识别** — 拍照 / 相册选图，视觉大模型识别食物名称、卡路里、6 项营养素 + AI 小贴士
- 🍳 **选食材做菜** — 选冰箱里的食材 + 厨具 + 口味，AI 推荐可做的菜谱（含热量 / 时间 / 难度 / 步骤）
- 📓 **饮食日记** — 按日期记录每餐（早 / 午 / 晚 / 加餐），食物贴纸卡片网格 + 当日摄入统计
- 📅 **日历视图** — 周视图日期切换，有记录的日期带圆点标记
- 🍽️ **健康食谱** — 杂志风卡片墙，搜索 + 分类筛选，收藏自定义食谱
- 💪 **训练计划** — 本周消耗柱状图 + 训练任务管理、完成打卡
- 💧 **习惯追踪** — 饮水（+250/500/750ml）+ 运动时长记录，快捷弹窗交互
- 🎯 **目标设置** — 卡路里 / 碳水 / 蛋白质 / 脂肪 / 饮水 / 运动目标可配置
- ☁️ **云同步** — Supabase 用户登录 + 多设备同步，localStorage 离线缓存兜底
- 💾 **本地持久化** — 所有数据本地存储（`fuelog_` 前缀），刷新不丢失
- 🌐 **PWA 部署** — HashRouter + GitHub Pages，微信浏览器可直接访问

---

## 🛠️ 技术栈

- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS 3** — 布局 / 色彩 / 动画
- **Framer Motion 11** — 页面转场与微交互动画
- **Recharts 2** — 训练消耗柱状图
- **React Router v6**（HashRouter，兼容 GitHub Pages 与微信）
- **@iconify/icons-solar** — Solar 图标集
- **@supabase/supabase-js** — 云数据库 / 认证
- **Kimi / DeepSeek API** — AI 视觉识别与菜谱生成

---

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18

### 安装与运行

```bash
# 克隆项目
git clone git@github.com:clanzhang/Fuelog.git
cd Fuelog

# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 生产构建
npm run build

# 本地预览生产构建
npm run preview
```

---

## 🔑 环境变量配置

在项目根目录创建 `.env` 文件（参考 `.env.example`）：

```bash
# AI 拍照识别（Kimi 视觉模型）
VITE_DEEPSEEK_API_KEY=your_key_here

# AI 菜谱推荐（DeepSeek）
VITE_DEEPSEEK_RECIPE_API_KEY=your_key_here

# Supabase 云同步（可选，留空则仅本地存储）
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ `.env` 已被 `.gitignore` 忽略，密钥不会提交到仓库。

---

## ☁️ Supabase 云同步

将 localStorage 数据升级为 Supabase 云数据库，实现**用户登录 + 多设备同步**。

### 配置步骤

1. 在 [supabase.com](https://supabase.com) 创建免费项目
2. 在 **SQL Editor** 全选执行 `supabase/schema.sql`（建表 + RLS 安全策略）
3. 在 **Settings → API** 复制 URL 和 anon key，填入 `.env`
4. 在 **Authentication → Providers → Email** 开启邮箱登录

### 登录方式

- **邮箱验证码一键登录**（OTP）：输入邮箱 → 收到验证码 → 输入即登录，首次登录自动创建账号，无需密码。

### 工作原理

- 未配置 / 未登录：数据只存 localStorage，正常使用
- 已登录：每次操作同时写 localStorage + Supabase
- 读取：优先读 Supabase，失败时 fallback 到 localStorage
- 首次登录自动把本地旧数据迁移到云端
- 图片（base64）不上传云端，只存文字数据

---

## 🚢 部署到 GitHub Pages

项目已配置 `gh-pages` 部署：

```bash
# 一键构建并部署到 gh-pages 分支
npm run deploy

# 访问地址
# https://clanzhang.github.io/Fuelog/
```

---

## ⚠️ 使用说明

- 本仓库为**个人项目**，仅供学习与自用
- AI 功能需自行申请并配置对应 API Key（DeepSeek / Supabase）
- 所有数据默认仅存本地，配置 Supabase 后可实现云端备份
