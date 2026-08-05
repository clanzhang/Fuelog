import { motion } from 'framer-motion'
import type { FoodItem } from '../types'

export default function FoodStickerCard({
  food,
  onClick,
  index = 0,
}: {
  food: FoodItem
  onClick?: () => void
  index?: number
}) {
  // 轻微随机旋转 -2° ~ +2°
  const rotate = ((index * 37) % 5) - 2

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 6) * 0.06, type: 'spring', damping: 22 }}
      whileTap={{ scale: 0.96 }}
      style={{ rotate }}
      className="notebook-bg relative flex flex-col overflow-hidden rounded-2xl border border-dashed border-primary/20 bg-[#FFFDF6] p-2.5 text-left shadow-[0_2px_12px_rgba(57,66,222,0.06)]"
    >
      <div className="relative">
        {/* 白色边框 + 虚线内圈 + 八角形照片 */}
        <div className="clip-octagon rounded-md bg-white p-1 shadow-sm">
          <div className="clip-octagon flex h-24 w-full items-center justify-center bg-gradient-to-br text-5xl">
            <span className="drop-shadow-sm">{food.emoji}</span>
          </div>
        </div>
        <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px] shadow">
          🔥{food.calories}
        </span>
      </div>
      <div className="mt-2 px-0.5 pb-1">
        <p className="truncate font-display text-[13px] font-bold text-ink">{food.name}</p>
        <p className="mt-0.5 text-[11px] font-medium text-ink/45">
          {food.calories} kcal · {food.time}
        </p>
      </div>
    </motion.button>
  )
}
