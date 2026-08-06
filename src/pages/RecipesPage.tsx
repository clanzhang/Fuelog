import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Page from '../components/Page'
import SolarIcon from '../components/SolarIcon'
import { useData } from '../context/DataContext'
import ActionSheet from '../components/ActionSheet'

// 分类标签（固定预设）
const CATEGORY_TAGS = ['全部', '低卡', '高蛋白', '素食', '快手菜', '减脂餐']

// emoji 背景渐变（杂志大图风格）
const EMOJI_BG: Record<string, string> = {
  '🥗': 'from-green-100 to-emerald-50',
  '🍝': 'from-rose-100 to-orange-50',
  '🍤': 'from-orange-100 to-amber-50',
  '🥣': 'from-amber-100 to-yellow-50',
  '🍄': 'from-stone-100 to-amber-50',
  '🥞': 'from-yellow-100 to-amber-50',
  '🎃': 'from-orange-100 to-yellow-50',
  '🍲': 'from-emerald-100 to-teal-50',
  '🍳': 'from-amber-50 to-orange-100',
  '🥑': 'from-lime-100 to-green-50',
  '🍗': 'from-orange-100 to-red-50',
  '🐟': 'from-sky-100 to-blue-50',
}

export default function RecipesPage() {
  const { favorites, addFavorite, removeFavorite } = useData()
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [author, setAuthor] = useState('')
  const [calories, setCalories] = useState('')
  const [category, setCategory] = useState('')
  const [emoji, setEmoji] = useState('🍽️')
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('全部')

  const emojis = ['🥗', '🍝', '🍤', '🥣', '🍄', '🥞', '🎃', '🍲', '🍳', '🥑', '🍗', '🐟']

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
      {/* 顶部标题 */}
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
            const bg = EMOJI_BG[r.emoji || ''] || 'from-bg to-primary-soft'
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
          <p className="mt-1 text-sm text-ink/45">识别食物后可以收藏到食谱</p>
          <button
            onClick={() => setFormOpen(true)}
            className="mt-5 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-fab"
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

