import { motion } from 'framer-motion'
import type { FoodEntry } from '../types'

export default function FoodStickerCard({
  food,
  onClick,
  onDelete,
  index = 0,
}: {
  food: FoodEntry
  onClick?: () => void
  onDelete?: () => void
  index?: number
}) {
  // 轻微随机旋转 -2° ~ +2°
  const rotate = ((index * 37) % 5) - 2

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 6) * 0.06, type: 'spring', damping: 22 }}
      style={{ rotate }}
      className="notebook-bg relative flex flex-col overflow-hidden rounded-2xl border border-dashed border-primary/20 bg-[#FFFDF6] p-2.5 text-left shadow-[0_2px_12px_rgba(57,66,222,0.06)]"
    >
      <button onClick={onClick} className="flex-1 text-left">
        <div className="relative">
          {/* 优先显示抠图版：透明背景融入卡片 */}
          {food.cutoutImage ? (
            <div className="flex h-28 w-full items-center justify-center overflow-hidden">
              <img
                src={food.cutoutImage}
                alt={food.name}
                className="h-full w-full object-contain"
                draggable={false}
              />
            </div>
          ) : (
            /* 白色边框 + 虚线内圈 + 八角形照片（无抠图时） */
            <div className="clip-octagon rounded-md bg-white p-1 shadow-sm">
              <div className="clip-octagon flex h-24 w-full items-center justify-center bg-gradient-to-br from-primary-soft to-bg text-5xl">
                <span className="drop-shadow-sm">{food.emoji || '🍽️'}</span>
              </div>
            </div>
          )}
          <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px] shadow">
            🔥{food.calories}
          </span>
        </div>
        <div className="mt-2 px-0.5 pb-1">
          <p className="truncate font-display text-[13px] font-bold text-ink">{food.name}</p>
          <p className="mt-0.5 text-[11px] font-medium text-ink/45">
            {food.calories} kcal · {food.mealType}
          </p>
        </div>
      </button>
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-500 opacity-0 transition group-hover:opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </motion.div>
  )
}
