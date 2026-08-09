# Fuelog 🔥 Fitness & Diet Tracker

> A mobile-first responsive web app combining **fitness training management** and **AI-powered diet logging**.
>
> 📄 中文版 / [中文 README](README.md)

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 📸 **AI Photo Recognition** | Take/select a photo → vision model recognizes food name, calories, 6 nutrients + AI tips |
| 🍳 **Ingredient-to-Recipe** | Pick your ingredients + cookware + flavor → AI recommends recipes (calories / time / difficulty / steps) |
| 📓 **Food Diary** | Log meals by date (breakfast/lunch/dinner/snack) with sticker-style food cards and daily intake stats |
| 📅 **Calendar View** | Weekly date switcher with dot markers on logged days |
| 🍽️ **Recipes** | Magazine-style card wall with search, category filters, and favorites |
| 💪 **Training Plans** | Weekly burn bar chart (Recharts) + training task management & completion |
| 💧 **Habit Tracking** | Water intake (+250/500/750ml) & exercise minutes with quick-action sheets |
| 🎯 **Goal Settings** | Configurable calorie / macro / water / exercise goals |
| ☁️ **Cloud Sync** | Supabase auth + multi-device sync with localStorage offline fallback |
| 💾 **Local Persistence** | All data persisted locally (`fuelog_` prefix), survives refresh |
| 🌐 **PWA Deployment** | HashRouter + GitHub Pages, works on WeChat browser |

---

## 🛠️ Tech Stack

- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS 3** — layout, colors, animations
- **Framer Motion 11** — page transitions & micro-interactions
- **Recharts 2** — workout burn bar chart
- **React Router v6** (HashRouter, GitHub Pages & WeChat compatible)
- **@iconify/icons-solar** — Solar icon set
- **@supabase/supabase-js** — cloud database & auth
- **Kimi / DeepSeek API** — vision recognition & recipe generation

---

## 🚀 Quick Start

### Requirements

- Node.js ≥ 18

### Install & Run

```bash
# Clone
git clone git@github.com:clanzhang/Fuelog.git
cd Fuelog

# Install dependencies
npm install

# Start dev server (default http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 🔑 Environment Variables

Create a `.env` file at the project root (see `.env.example`):

```bash
# AI photo recognition (Kimi vision)
VITE_DEEPSEEK_API_KEY=your_key_here

# AI recipe recommendation (DeepSeek)
VITE_DEEPSEEK_RECIPE_API_KEY=your_key_here

# Supabase cloud sync (optional, leave empty for local-only)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ `.env` is gitignored; keys are never committed.

---

## ☁️ Supabase Cloud Sync

Upgrade localStorage to Supabase for **user login + multi-device sync**.

### Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the full `supabase/schema.sql` in the SQL Editor (tables + RLS policies)
3. Copy URL & anon key from **Settings → API** into `.env`
4. Enable email provider in **Authentication → Providers → Email**

### Login

- **Email OTP login**: enter email → receive code → enter code to log in. First login auto-creates the account; no password needed.

### How It Works

- No config / not logged in: data stays in localStorage
- Logged in: writes go to both localStorage and Supabase
- Reads prefer Supabase, falling back to localStorage
- First login auto-migrates local data to the cloud
- Images (base64) stay local; only text data is synced

---

## 🚢 Deploy to GitHub Pages

The project is configured for `gh-pages` deployment:

```bash
# Build & deploy to the gh-pages branch
npm run deploy

# Live URL
# https://clanzhang.github.io/Fuelog/
```

---

## ⚠️ Notes

- This is a **personal project** for learning and personal use
- AI features require your own API keys (DeepSeek / Supabase)
- Data is local by default; configure Supabase for cloud backup
