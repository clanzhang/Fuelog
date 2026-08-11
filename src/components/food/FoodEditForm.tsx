import { MEAL_LABEL, type MealType } from '../../types'

interface FoodEditFormProps {
  mealType: MealType
  onMealTypeChange: (m: MealType) => void
  date: string
  onDateChange: (d: string) => void
}

/**
 * 编辑模式表单：仅修改餐类和日期
 */
export default function FoodEditForm({ mealType, onMealTypeChange, date, onDateChange }: FoodEditFormProps) {
  return (
    <div className="mt-5 rounded-2xl bg-surface p-4 shadow-card">
      <p className="mb-3 text-xs font-semibold text-ink/50">餐类</p>
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(MEAL_LABEL) as MealType[]).map((m) => (
          <button
            key={m}
            onClick={() => onMealTypeChange(m)}
            className={`rounded-full py-2 text-xs font-semibold transition ${
              mealType === m ? 'bg-primary text-white' : 'bg-bg text-ink/50'
            }`}
          >
            {MEAL_LABEL[m]}
          </button>
        ))}
      </div>
      <p className="mb-2 mt-4 text-xs font-semibold text-ink/50">日期</p>
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-full rounded-xl bg-bg px-4 py-3 text-sm font-semibold text-ink outline-none"
      />
    </div>
  )
}
