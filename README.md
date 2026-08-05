# Fuelog 🔥 健身饮食追踪

移动端优先的响应式 Web App，融合**健身训练管理** + **AI 饮食记录**功能。设计参考 Dribbble 健身 App（蓝紫主题、圆角卡片、柔和阴影），核心功能参考 nosh 饮食记录工具。

图标集：[Solar Icons](https://icones.js.org/collection/solar)（via `@iconify/icons-solar`）

## 技术栈

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (动画)
- **Recharts** (圆环图、柱状图)
- **DeepSeek API** (AI 食物识别)
- **React Router v6** (路由)
- 字体: Nunito(标题) + DM Sans(正文)

## 快速开始

```bash
npm install
npm run dev
```

生产构建：`npm run build && npm run preview`

## AI 食物识别

在项目根目录创建 `.env` 文件（参考 `.env.example`）：

```
VITE_DEEPSEEK_API_KEY=your_key_here
```

- 未配置 API key 时，自动回退到 mock 数据
- 图片会自动压缩到 1024px 以内并转 base64
- DeepSeek 调用失败也会回退到 mock 数据

## 路由

| 路由 | 页面 |
| --- | --- |
| `/today` | 今日概览 |
| `/diary` | 饮食日记 (核心页) |
| `/recipes` | 健康食谱 |
| `/trainers` | 训练计划 |
| `/profile` | 个人中心 |
| `/food/:id` | 食物详情 |
| `/recognize` | AI 识别 |
| `/manual-add` | 手动输入 |

## 项目结构

```
src/
├── components/    # 全局组件 (TabBar/Sheet/日历/营养格/贴纸卡片等)
├── pages/         # 页面
├── data/          # mock 数据 (7天统计/12食物/5训练/8食谱)
├── services/      # DeepSeek API 服务
└── types.ts       # 类型定义
```
