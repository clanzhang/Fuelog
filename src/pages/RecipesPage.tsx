import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Page from '../components/Page'
import SolarIcon from '../components/SolarIcon'
import { RECIPES, RECIPE_TAGS } from '../data/mock'

export default function RecipesPage() {
  const [tag, setTag] = useState('全部')
  const [query, setQuery] = useState('')
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  const filtered = useMemo(
    () =>
      RECIPES.filter(
        (r) =>
          (tag === '全部' || r.tag === tag) &&
          (query === '' || r.name.includes(query)),
      ),
    [tag, query],
  )

  return (
    <Page>
      <h1 className="font-display text-2xl font-black text-ink">健康食谱</h1>
      <p className="mt-0.5 text-sm font-medium text-ink/45">灵感来自好味道与好身材</p>

      {/* 搜索栏 */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-surface px-4 py-3 shadow-card">
          <SolarIcon name="search" size={18} className="text-ink/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索食谱..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
          />
        </div>
        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary shadow-card">
          <SolarIcon name="filters" size={18} />
        </button>
      </div>

      {/* 分类标签 */}
      <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">
        {RECIPE_TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              tag === t ? 'bg-primary text-white shadow-fab' : 'bg-surface text-ink/55'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 食谱卡片 */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {filtered.map((r, i) => {
          const isLiked = liked[r.id] ?? r.liked
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 4) * 0.05 }}
              className="overflow-hidden rounded-2xl bg-surface shadow-card"
            >
              <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-bg to-primary-soft text-5xl">
                <span className="drop-shadow-sm">{r.emoji}</span>
                <button
                  onClick={() => setLiked((p) => ({ ...p, [r.id]: !isLiked }))}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow"
                >
                  <SolarIcon
                    name="heart"
                    size={14}
                    className={isLiked ? 'text-rose-500' : 'text-ink/30'}
                  />
                </button>
                <span className="absolute bottom-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                  {r.calories} kcal
                </span>
              </div>
              <div className="p-3">
                <p className="truncate font-display text-[13px] font-bold text-ink">{r.name}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[11px] text-ink/45">@{r.author}</span>
                  <span className="flex items-center gap-0.5 text-[11px] font-semibold text-accent-orange">
                    <SolarIcon name="clock" size={12} /> {r.time}min
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 text-center">
          <span className="text-5xl">🔍</span>
          <p className="mt-3 text-sm text-ink/45">没有找到相关食谱</p>
        </div>
      )}
    </Page>
  )
}
