import { useState } from 'react'
import { motion } from 'framer-motion'
import Page from '../components/Page'
import SolarIcon from '../components/SolarIcon'
import { useData } from '../context/DataContext'
import ActionSheet from '../components/ActionSheet'

export default function RecipesPage() {
  const { favorites, addFavorite, removeFavorite } = useData()
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [author, setAuthor] = useState('')
  const [calories, setCalories] = useState('')
  const [category, setCategory] = useState('')
  const [emoji, setEmoji] = useState('🍽️')
  const [query, setQuery] = useState('')

  const emojis = ['🥗', '🍝', '🍤', '🥣', '🍄', '🥞', '🎃', '🍲', '🍳', '🥑', '🍗', '🐟']

  const filtered = favorites.filter(
    (r) => query === '' || r.name.includes(query) || r.category.includes(query),
  )

  const submit = () => {
    if (!name.trim()) return
    addFavorite({
      id: `fav_${Date.now()}`,
      name: name.trim(),
      author: author.trim() || '我',
      emoji,
      calories: Number(calories) || 0,
      category: category.trim() || '自定义',
    })
    setFormOpen(false)
    setName('')
    setAuthor('')
    setCalories('')
    setCategory('')
    setEmoji('🍽️')
  }

  return (
    <Page>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-ink">健康食谱</h1>
          <p className="mt-0.5 text-sm font-medium text-ink/45">收藏你的健康食谱</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-fab active:scale-90"
        >
          <SolarIcon name="add" size={22} />
        </button>
      </div>

      {/* 搜索栏 */}
      {favorites.length > 0 && (
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
        </div>
      )}

      {/* 收藏列表 */}
      {filtered.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {filtered.map((r, i) => (
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
                  onClick={() => removeFavorite(r.id)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow"
                >
                  <SolarIcon name="heart" size={14} className="text-rose-500" />
                </button>
                <span className="absolute bottom-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                  {r.calories} kcal
                </span>
              </div>
              <div className="p-3">
                <p className="truncate font-display text-[13px] font-bold text-ink">{r.name}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[11px] text-ink/45">@{r.author}</span>
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {r.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-2xl bg-surface py-14 shadow-card">
          <span className="text-5xl">🍽️</span>
          <p className="mt-3 font-display text-base font-bold text-ink">还没有收藏食谱</p>
          <p className="mt-1 text-sm text-ink/45">点击右上角 + 收藏你的健康食谱</p>
          <button
            onClick={() => setFormOpen(true)}
            className="mt-4 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-white"
          >
            收藏食谱
          </button>
        </div>
      )}

      {/* 添加收藏表单 */}
      <ActionSheet open={formOpen} onClose={() => setFormOpen(false)} title="收藏食谱">
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="食谱名称"
            className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="作者"
              className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              type="number"
              placeholder="卡路里 kcal"
              className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="分类（如：高蛋白 / 素食）"
            className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex flex-wrap gap-2">
            {emojis.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${
                  emoji === e ? 'bg-primary-soft ring-2 ring-primary/40' : 'bg-bg'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <button
            onClick={submit}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-white shadow-fab"
          >
            保存收藏
          </button>
        </div>
      </ActionSheet>
    </Page>
  )
}

