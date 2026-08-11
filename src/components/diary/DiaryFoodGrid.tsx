import FoodStickerCard from '../FoodStickerCard'
import type { FoodEntry } from '../../types'

interface DiaryFoodGridProps {
  foods: FoodEntry[]
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

/**
 * 食物记录网格 + 空状态
 */
export default function DiaryFoodGrid({ foods, onOpen, onDelete }: DiaryFoodGridProps) {
  if (foods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-surface py-16 shadow-card">
        <span className="text-5xl">🥗</span>
        <p className="mt-4 font-display text-base font-bold text-ink">今天还没有记录饮食</p>
        <p className="mt-1 text-sm text-ink/45">点击下方 + 添加第一餐</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {foods.map((f, i) => (
        <FoodStickerCard
          key={f.id}
          food={f}
          index={i}
          onClick={() => onOpen(f.id)}
          onDelete={() => onDelete(f.id)}
        />
      ))}
    </div>
  )
}
