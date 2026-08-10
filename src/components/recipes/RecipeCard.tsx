import { motion } from 'framer-motion'
import SolarIcon from '../SolarIcon'
import type { FavoriteRecipe } from '../../types'

// emoji 背景渐变（数组形式，按 emoji 匹配）
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

const DEFAULT_BG = 'from-bg to-primary-soft'
export function emojiBg(emoji?: string): string {
  return EMOJI_BG.find((e) => e.emoji === emoji)?.bg ?? DEFAULT_BG
}

/**
 * 食谱杂志卡片（单张）
 */
export default function RecipeCard({
  recipe,
  index = 0,
  onRemove,
}: {
  recipe: FavoriteRecipe
  index?: number
  onRemove?: (id: string) => void
}) {
  const bg = emojiBg(recipe.emoji)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 4) * 0.05 }}
      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
    >
      {/* 顶部大图（占卡片 60%） */}
      <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${bg} text-6xl`}>
        <span className="drop-shadow-lg">{recipe.emoji}</span>
        {onRemove && (
          <button
            onClick={() => onRemove(recipe.id)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow active:scale-90"
            aria-label="取消收藏"
          >
            <SolarIcon name="heart" size={15} className="text-rose-500" />
          </button>
        )}
      </div>
      {/* 底部白色信息区 */}
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-1">
          <p className="line-clamp-2 font-display text-[13px] font-bold leading-snug text-ink">
            {recipe.name}
          </p>
        </div>
        <p className="mt-1 text-[11px] text-ink/45">@{recipe.author}</p>
        <div className="mt-auto pt-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
            {recipe.calories} Kcal
          </span>
        </div>
      </div>
    </motion.div>
  )
}
