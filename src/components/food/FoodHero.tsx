import { MEAL_LABEL, type MealType } from '../../types'
import type { FoodEntry } from '../../types'

interface FoodHeroProps {
  food: FoodEntry
}

/**
 * 食物详情圆形照片 + 名称 + 餐类/日期 + 卡路里（均只读）
 */
export default function FoodHero({ food }: FoodHeroProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="notebook-bg rounded-full border border-dashed border-primary/20 bg-[#FFFDF6] p-2 shadow-card">
        {food.imageUrl ? (
          <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full">
            <img
              src={food.imageUrl}
              alt={food.name}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        ) : (
          <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-primary-soft to-bg text-7xl">
            {food.emoji || '🍽️'}
          </div>
        )}
      </div>
      <h1 className="mt-4 font-display text-2xl font-black text-ink">{food.name}</h1>
      <p className="mt-1 flex items-center gap-2 text-sm font-medium text-ink/45">
        {MEAL_LABEL[food.mealType as MealType]} · {food.date}
      </p>
      <div className="mt-3 flex flex-col items-center rounded-2xl px-4 py-1">
        <span className="font-display text-[28px] font-extrabold leading-none text-primary">
          {food.calories}
        </span>
        <span className="mt-0.5 text-[10px] text-ink/40">kcal</span>
      </div>
    </div>
  )
}
