import { MEAL_LABEL, type MealType } from '../../types'
import type { FoodEntry } from '../../types'

interface MealSummaryProps {
  foods: FoodEntry[]
}

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

/**
 * 餐类汇总标签：按餐类聚合当日热量
 */
export default function MealSummary({ foods }: MealSummaryProps) {
  if (foods.length === 0) return null
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {MEAL_ORDER.map((m) => {
        const items = foods.filter((f) => f.mealType === m)
        if (items.length === 0) return null
        return (
          <span key={m} className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold text-primary">
            {MEAL_LABEL[m]} {items.reduce((s, f) => s + f.calories, 0)} kcal
          </span>
        )
      })}
    </div>
  )
}
