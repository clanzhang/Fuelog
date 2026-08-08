# Fuelog 🔥 健身饮食追踪

一个移动端优先的响应式 Web App，融合 **健身训练管理** + **AI 饮食记录** 功能。

- 🎨 设计参考 Dribbble 健身 App：蓝紫主题、圆角卡片、柔和阴影
- 🤖 核心功能参考 nosh 饮食记录工具：拍照识别食物热量、营养素分析、每日饮食日记
- 🔌 图标集：[Solar Icons](https://icones.js.org/collection/solar)（via `@iconify/icons-solar`）

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

## ☁️ Supabase 云同步

项目支持将 localStorage 数据升级为 Supabase 云数据库，实现**用户登录 + 多设备同步**：

1. 在 [supabase.com](https://supabase.com) 创建免费项目
2. 在 **SQL Editor** 执行 `supabase/schema.sql` 建表脚本（已含 RLS 安全策略）
3. 在 **Settings → API** 复制 URL 和 anon key，填入 `.env`
4. 在 **Authentication → Providers → Email** 开启邮箱登录

**工作原理：**
- 未配置 / 未登录：数据只存 localStorage，正常使用
- 已登录：每次操作同时写 localStorage + Supabase
- 读取：优先读 Supabase，失败时 fallback 到 localStorage
- 首次登录自动把本地旧数据迁移到云端
- 图片（base64）不上传云端，只存文字数据

## 🚢 部署到 GitHub Pages

项目已配置 `gh-pages` 部署：

```bash
# 一键构建并部署到 gh-pages 分支
npm run deploy
```
