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
VITE_DEEPSEEK_API_KEY=your_deepseek_key_here
```

> ⚠️ `.env` 已被 `.gitignore` 忽略，密钥不会提交到仓库。

## 🚢 部署到 GitHub Pages

项目已配置 `gh-pages` 部署：

```bash
# 一键构建并部署到 gh-pages 分支
npm run deploy
```
