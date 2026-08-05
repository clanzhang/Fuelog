# Fuelog 🔥 健身饮食追踪

一个移动端优先的响应式 Web App，融合 **健身训练管理** + **AI 饮食记录** 功能。

- 🎨 设计参考 Dribbble 健身 App：蓝紫主题、圆角卡片、柔和阴影
- 🤖 核心功能参考 nosh 饮食记录工具：拍照识别食物热量、营养素分析、每日饮食日记
- 🔌 图标集：[Solar Icons](https://icones.js.org/collection/solar)（via `@iconify/icons-solar`）

---

## ✨ 功能亮点

| 功能 | 说明 |
| --- | --- |
| 📊 今日概览 | 圆环进度图展示摄入/目标热量 + 营养素指标 + 习惯追踪 |
| 📒 饮食日记 | 一周日期选择、总摄入横幅、八角形"贴纸卡片"瀑布流 |
| 📷 AI 食物识别 | 拍照/相册上传 → DeepSeek 识别食物与营养素 |
| 🍳 健康食谱 | 搜索 + 分类标签 + 双列卡片 + 收藏 |
| 💪 训练计划 | 柱状图展示本周消耗，可展开查看动作/组数/休息 |
| 👤 个人中心 | 打卡统计 + 卡路里/营养素/饮水/运动目标设置 |
| ✨ 流畅动画 | 页面切换、卡片入场、FAB 弹跳、圆环填充 |

---

## 🛠 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vite + React 18 + TypeScript |
| 样式 | Tailwind CSS |
| 动画 | Framer Motion |
| 图表 | Recharts（圆环图、柱状图） |
| 路由 | React Router v6 |
| AI | DeepSeek API（食物识别） |
| 图标 | Solar Icons via `@iconify/icons-solar` |
| 字体 | Nunito（标题/数字）+ DM Sans（正文） |

---

## 🎨 设计规范

### 色彩

```css
Primary:        #3942DE
Primary Dark:   #22289C
Background:     #F2F3F8
Surface:        #FFFFFF
Text Primary:   #1E1E2E
Text Secondary: #6B6B80
Accent Orange:  #AC5923
Accent Gold:    #B29A6B
```

### 样式规则

- 卡片：`rounded-2xl` + `shadow-[0_4px_20px_rgba(57,66,222,0.08)]`
- 按钮：`rounded-full`
- 字体：Nunito（标题/数字，粗体）+ DM Sans（正文）
- 数字：28px / 800 用于卡路里大数字

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
VITE_DEEPSEEK_API_KEY=your_deepseek_key_here
```

> ⚠️ `.env` 已被 `.gitignore` 忽略，密钥不会提交到仓库。

### AI 识别逻辑

- **未配置 API key** → 自动回退到 mock 数据
- **配置了 key** → 调用 DeepSeek `deepseek-chat` 模型识别
- **调用失败** → 回退到 mock 数据（控制台打印 warning）
- 图片自动压缩到 **1024px** 以内并转 base64 后上传

---

## 🗺 路由

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/today` | 今日概览 | 统计大卡片、习惯追踪、训练计划 |
| `/diary` | 饮食日记 | 核心页，贴纸卡片瀑布流 |
| `/recipes` | 健康食谱 | 搜索 + 分类 + 收藏 |
| `/trainers` | 训练计划 | 柱状图 + 可展开训练详情 |
| `/profile` | 个人中心 | 统计与目标设置 |
| `/food/:id` | 食物详情 | 六宫格营养 + AI Tips |
| `/recognize` | AI 识别 | 拍照/相册 + 识别结果 |
| `/manual-add` | 手动输入 | 手动录入食物与营养 |

---

## 🚢 部署到 GitHub Pages

项目已配置 `gh-pages` 部署：

```bash
# 一键构建并部署到 gh-pages 分支
npm run deploy
```

- 部署地址：`https://clanzhang.github.io/Fuelog/`
- 构建脚本：`build:gh`（`GH_PAGES=true` 时 `base` 设为 `/Fuelog/`）
- 已内置 `public/404.html`，确保 SPA 路由在 GitHub Pages 正常工作
- 部署前需在仓库 **Settings → Pages** 将分支设为 `gh-pages`

> 本地开发不受影响，`npm run dev` 正常使用 `/` 路径。

---

## 📱 页面功能详情

### /today — 今日概览

- 顶部："Today" 标题 + "Week 17 · Wed, Aug 5" + 日历图标（底部弹出月历，有数据日期显示圆点）
- 每日统计大卡片（渐变背景 `#3942DE → #22289C`，白字）：
  - 圆环进度图：已摄入 971 / 目标 2000 kcal + 运动消耗 350 kcal
  - 营养素：碳水 35/129g · 蛋白质 80/125g · 脂肪 25/55g
- 习惯追踪卡片：
  - 饮水：水杯图标 + "1.5L / 2L Per Day" + 标签（水|茶|咖啡）
  - 运动：跑步图标 + "15 min / 1h Per Day" + 标签（慢跑|跑步|骑行）
- 训练计划列表："My Training Plans" + "See All"，背景交替 `#EEF0FF` / `#F8F8FC`

### /diary — 饮食日记（核心页）

- 日期选择条：横向一周日期，选中蓝紫圆形高亮，弹性缩放动画
- 总摄入横幅："总摄入 (kcal)" + 大数字 "971 / 2000"
- 食物记录网格（2 列瀑布流）：
  - "贴纸卡片"：八角形裁剪照片 + 白色边框 + 虚线内圈
  - 米白背景 + 淡虚线纹理（笔记本风格）
  - 卡片轻微随机旋转（-2°~+2°）
  - 点击 → 食物详情页
- FAB "+" 按钮 → 底部 ActionSheet：📷 拍照识别 / 🖼️ 相册选择 / 🔍 搜索食物 / ✏️ 手动输入

### /recipes — 健康食谱

- 搜索栏 + 筛选图标
- 分类标签横向滚动：全部|低卡|高蛋白|素食|快手菜|减脂餐
- 双列卡片：大图 + 名称 + 作者 + 卡路里标签 + ♡ 收藏

### /trainers — 训练计划

- 本周柱状图（Recharts）：每天运动消耗，当日蓝紫高亮
- 训练列表：可展开查看动作/组数/休息时间

### /profile — 个人中心

- 头像 + 用户名 + 会员徽章
- 统计：连续打卡 | 总记录餐数 | 总消耗
- 设置：卡路里/营养素/饮水/运动目标 + 单位切换

---

## 🎬 动画

1. 页面切换：Framer Motion 左右滑动
2. 卡片入场：`staggerChildren` 从下方淡入
3. FAB：点击弹跳 `scale: [1, 0.9, 1.1, 1]`
4. AI 识别："✨ 思考中..." 脉冲 + 旋转星星
5. 圆环图：数字递增 + 圆环填充动画
6. 日期选择：弹性缩放
7. 底部 Sheet：滑入带弹性（spring）

---

## 📁 项目结构

```
Fuelog/
├── index.html                 # 入口 HTML（含字体链接）
├── vite.config.ts             # Vite 配置（含 GH_PAGES base 切换）
├── tailwind.config.js         # Tailwind 主题（色彩/字体/阴影）
├── postcss.config.js
├── tsconfig.json / tsconfig.node.json
├── package.json
├── .env.example               # 环境变量模板
├── .gitignore
├── public/
│   └── 404.html               # GitHub Pages SPA 路由兜底
└── src/
    ├── main.tsx               # 入口（BrowserRouter）
    ├── App.tsx                # 路由 + 手机模拟框 + TabBar + ActionSheet
    ├── index.css              # Tailwind + 全局样式 + 纹理工具类
    ├── types.ts               # 类型定义
    ├── components/            # 全局组件
    │   ├── BottomTabBar.tsx   # 毛玻璃底部导航 + 中间 FAB
    │   ├── ActionSheet.tsx    # 底部弹出选择器
    │   ├── CalendarModal.tsx  # 底部弹出月历
    │   ├── NutritionGrid.tsx  # 2×3 六宫格营养素
    │   ├── FoodStickerCard.tsx# 八角形贴纸卡片
    │   ├── ProgressRing.tsx   # 圆环进度图
    │   ├── SolarIcon.tsx      # Solar 图标封装
    │   └── Page.tsx           # 页面容器 + 页头 + 过渡动画
    ├── pages/                 # 8 个页面
    │   ├── TodayPage.tsx
    │   ├── DiaryPage.tsx
    │   ├── RecipesPage.tsx
    │   ├── TrainersPage.tsx
    │   ├── ProfilePage.tsx
    │   ├── FoodDetailPage.tsx
    │   ├── AiRecognizePage.tsx
    │   └── ManualAddPage.tsx
    ├── services/
    │   └── deepseek.ts        # DeepSeek API + 图片压缩 + fallback
    └── data/
        └── mock.ts            # mock 数据（7 天统计 / 12 食物 / 5 训练 / 8 食谱）
```

---

## 📦 Mock 数据

- 7 天统计：每日摄入/消耗/三大营养素/饮水量
- 12 个食物记录：名称、emoji、热量、份量、六宫格营养、AI 小贴士
- 5 个训练计划：动作、组数、次数、休息时间、消耗
- 8 个健康食谱：作者、热量、蛋白质、烹饪时长、分类标签

---

## 📱 响应式

- 移动端优先（设计基准 375px）
- 桌面端：App 居中显示在手机模拟框内（`max-w-[430px]`），两侧深色背景 `#1E1E2E`
- `sm` 断点以上显示圆角手机边框效果

---

## 💡 注意事项

- 中文界面，单位保留英文（kcal, g, mg）
- 空状态友好提示（"今天还没记录饮食哦~"）
- API key 通过 `.env` 的 `VITE_DEEPSEEK_API_KEY` 读取，且已被 `.gitignore` 忽略
- DeepSeek 调用失败自动 fallback 到 mock 数据
- 图片压缩到 1024px 以内转 base64 再识别

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 改进项目！

## 📄 License

MIT © 2026 Fuelog

