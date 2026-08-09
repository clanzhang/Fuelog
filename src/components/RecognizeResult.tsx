import { motion } from 'framer-motion'
import SolarIcon from './SolarIcon'
import { MEAL_LABEL, type MealType } from '../types'
import type { FoodAnalysisResult } from '../utils/ai'

export const NUTRITION_CELLS: {
  key: keyof Pick<FoodAnalysisResult, 'carbs' | 'protein' | 'fat' | 'fiber' | 'sugar' | 'sodium'>
  label: string
  unit: string
}[] = [
  { key: 'carbs', label: '碳水', unit: 'g' },
  { key: 'protein', label: '蛋白质', unit: 'g' },
  { key: 'fat', label: '脂肪', unit: 'g' },
  { key: 'fiber', label: '纤维', unit: 'g' },
  { key: 'sugar', label: '糖', unit: 'g' },
  { key: 'sodium', label: '盐', unit: 'mg' },
]

/**
 * AI 识别结果编辑区：名称 / 卡路里 / 营养素 / 餐类 / 日期 / 操作按钮
 */
export default function RecognizeResult({
  result,
  editedKeys,
  mealType,
  date,
  saving,
  onFieldChange,
  onEditCalories,
  onEditNutrition,
  onMealTypeChange,
  onDateChange,
  onCancel,
  onSave,
  onManual,
}: {
  result: FoodAnalysisResult
  editedKeys: string[]
  mealType: MealType
  date: string
  saving: boolean
  onFieldChange: (patch: Partial<FoodAnalysisResult>) => void
  onEditCalories: () => void
  onEditNutrition: (key: keyof Pick<FoodAnalysisResult, 'carbs' | 'protein' | 'fat' | 'fiber' | 'sugar' | 'sodium'>, label: string) => void
  onMealTypeChange: (m: MealType) => void
  onDateChange: (d: string) => void
  onCancel: () => void
  onSave: () => void
  onManual: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* 名称 */}
      <input
        value={result.name}
        onChange={(e) => onFieldChange({ name: e.target.value })}
        placeholder="食物名称"
        className="w-full bg-transparent text-center font-display text-2xl font-black text-ink outline-none"
      />
      {/* 卡路里 */}
      <button
        onClick={onEditCalories}
        className="mx-auto mt-1 flex items-center gap-2 rounded-full px-4 py-1 transition active:scale-95"
      >
        <span className={`font-display text-xl font-extrabold ${editedKeys.includes('calories') ? 'text-primary' : 'text-ink'}`}>
          {result.calories} kcal
        </span>
        <SolarIcon name="edit" size={14} className="text-ink/40" />
      </button>

      {/* 黄色横幅 */}
      <div className="mt-3 flex items-center justify-center gap-1 rounded-full bg-amber-400/20 py-2">
        <span className="text-sm">🥗</span>
        <span className="text-xs font-bold text-amber-700">拍照识别卡路里 · 记录饮食</span>
      </div>

      {/* 低置信度提示 */}
      {result.confidence === 'low' && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
          <SolarIcon name="bolt" size={14} className="shrink-0 text-amber-500" />
          识别可能不准确，建议手动调整
        </div>
      )}

      {/* 六宫格营养素 */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {NUTRITION_CELLS.map((cell) => {
          const edited = editedKeys.includes(cell.key)
          return (
            <button
              key={cell.key}
              onClick={() => onEditNutrition(cell.key, cell.label)}
              className={`flex flex-col items-center rounded-2xl py-3 transition active:scale-95 ${edited ? 'bg-primary-soft ring-2 ring-primary/30' : 'bg-bg'}`}
            >
              <span className="text-xs font-medium text-ink/45">{cell.label}</span>
              <span className={`mt-0.5 font-display text-lg font-extrabold ${edited ? 'text-primary' : 'text-ink'}`}>
                {result[cell.key]}
              </span>
              <span className="text-[10px] text-ink/40">{cell.unit}</span>
            </button>
          )
        })}
      </div>

      {/* 餐类选择 */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold text-ink/50">餐类</p>
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
      </div>

      {/* 日期选择 */}
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-bg px-4 py-3">
        <span className="text-xs font-semibold text-ink/50">日期</span>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-transparent text-sm font-semibold text-ink outline-none"
        />
      </div>

      {/* 底部三按钮 */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink/50"
        >
          <SolarIcon name="close" size={22} />
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex h-14 items-center justify-center rounded-full bg-ink px-10 text-white"
        >
          {saving ? (
            <span className="flex items-center gap-1 text-xs font-semibold">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                ✨
              </motion.span>
              保存中
            </span>
          ) : (
            <SolarIcon name="check" size={22} />
          )}
        </button>
        <button
          onClick={onManual}
          disabled={saving}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink/50"
        >
          <SolarIcon name="edit" size={20} />
        </button>
      </div>
    </motion.div>
  )
}
