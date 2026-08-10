import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Page from '../components/Page'
import SolarIcon from '../components/SolarIcon'
import { useData } from '../context/DataContext'
import { useNavigate } from 'react-router-dom'

// 分类标签（固定预设）
const CATEGORY_TAGS = ['全部', '低卡', '高蛋白', '素食', '快手菜', '减脂餐']

// emoji 背景渐变（杂志大图风格）—— 数组形式，按 emoji 匹配
const EMOJI_BG: { emoji: string; bg: string }[] = [
  { emoji: '🥗', bg: 'from-green-100 to-emerald-50' },
  { emoji: '🍝', bg: 'from-rose-100 to-orange-50' },
  { emoji: '🍤', bg: 'from-orange-100 to-amber-50' },
  { emoji: '🥣', bg: 'from-amber-100 to-yellow-50' },
  { emoji: '🍄', bg: 'from-stone-100 to-amber-50' },
  { emoji: '🥞', bg: 'from-yellow-100 to-amber-50' },
  { emoji: '🎃', bg: 'from-orange-100 to-yellow-50' },
  { emoji: '🍲', bg: 'from-emerald-100 to-teal-50' },
  { emoji: '🍳', bg: 'from-amber-50 to-orange-100' },
  { emoji: '🥑', bg: 'from-lime-100 to-green-50' },
  { emoji: '🍗', bg: 'from-orange-100 to-red-50' },
  { emoji: '🐟', bg: 'from-sky-100 to-blue-50' },
]

// 根据 emoji 取渐变（找不到用默认）
const DEFAULT_BG = 'from-bg to-primary-soft'
function emojiBg(emoji?: string): string {
  return EMOJI_BG.find((e) => e.emoji === emoji)?.bg ?? DEFAULT_BG
}

export default function RecipesPage() {
  const { favorites, removeFavorite } = useData()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('全部')

  // 搜索 + 分类筛选
  const filtered = useMemo(
    () =>
      favorites.filter(
        (r) =>
          (activeTag === '全部' || r.category === activeTag) &&
          (query === '' || r.name.includes(query) || r.category.includes(query)),
      ),
    [favorites, activeTag, query],
  )

  return (
    <Page>
      {/* 顶部标题（去掉右上角 + 按钮） */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-ink">健康食谱</h1>
          <p className="mt-0.5 text-sm font-medium text-ink/45">收藏你的健康食谱</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
          <SolarIcon name="book" size={20} />
        </div>
      </div>

      {/* "今天做什么" 入口横幅 */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate('/ingredient-pick')}
        className="mt-4 flex w-full items-center gap-4 rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-5 text-left text-white shadow-fab active:scale-[0.98]"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl">
          🍳
        </span>
        <div className="flex-1">
          <p className="font-display text-lg font-extrabold">今天做什么？</p>
          <p className="mt-0.5 text-xs text-white/70">选一下你有的食材，AI 推荐菜谱</p>
        </div>
        <SolarIcon name="arrow-right" size={20} className="text-white/70" />
      </motion.button>

      {/* 搜索区（浅灰圆角） */}
      {favorites.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-gray-100 px-4 py-2.5">
            <SolarIcon name="search" size={18} className="text-ink/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索食谱..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-ink/50">
            <SolarIcon name="filters" size={18} />
          </button>
        </div>
      )}

      {/* 分类标签栏（胶囊） */}
      {favorites.length > 0 && (
        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
          {CATEGORY_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeTag === t
                  ? 'bg-primary text-white shadow-fab'
                  : 'border border-ink/10 bg-surface text-ink/55'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* 杂志卡片墙（2列等高） */}
      {filtered.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {filtered.map((r, i) => {
            const bg = emojiBg(r.emoji)
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 4) * 0.05 }}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              >
                {/* 顶部大图（占卡片 60%） */}
                <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${bg} text-6xl`}>
                  <span className="drop-shadow-lg">{r.emoji}</span>
                  <button
                    onClick={() => removeFavorite(r.id)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow active:scale-90"
                  >
                    <SolarIcon name="heart" size={15} className="text-rose-500" />
                  </button>
                </div>
                {/* 底部白色信息区 */}
                <div className="flex flex-1 flex-col p-3">
                  <div className="flex items-start justify-between gap-1">
                    <p className="line-clamp-2 font-display text-[13px] font-bold leading-snug text-ink">
                      {r.name}
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] text-ink/45">@{r.author}</p>
                  <div className="mt-auto pt-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                      {r.calories} Kcal
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        /* 空状态（书本图标，与 Diary 不同） */
        <div className="mt-10 flex flex-col items-center justify-center rounded-3xl bg-surface py-16 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
            <SolarIcon name="book" size={36} className="text-primary" />
          </div>
          <p className="mt-4 font-display text-base font-bold text-ink">还没有收藏食谱</p>
          <p className="mt-1 text-sm text-ink/45">AI 识别结果或食材选菜后可收藏</p>
          <button
            onClick={() => navigate('/ingredient-pick')}
            className="mt-3 text-sm text-ink/40 transition-colors hover:text-primary"
          >
            选食材做菜 →
          </button>
        </div>
      )}
    </Page>
  )
}

