import RecognizeResult from './RecognizeResult'
import RecognizeError from './RecognizeError'
import RecognizeLoadingFooter from './RecognizeLoadingFooter'
import type { FoodAnalysisResult } from '../utils/ai'
import type { MealType } from '../types'

export type RecognizeStatus = 'compressing' | 'analyzing' | 'success' | 'error'

/**
 * AI 识别页底部控制区
 * 根据状态分发：成功 → RecognizeResult / 失败 → RecognizeError / 处理中 → RecognizeLoadingFooter
 */
export default function RecognizeControls({
  status,
  result,
  errorMsg,
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
  onRetry,
}: {
  status: RecognizeStatus
  result: FoodAnalysisResult | null
  errorMsg: string
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
  onRetry: () => void
}) {
  return (
    <div className="no-scrollbar relative z-10 max-h-[52%] overflow-y-auto rounded-t-[2rem] bg-surface px-6 pb-8 pt-4">
      {status === 'success' && result ? (
        <RecognizeResult
          result={result}
          editedKeys={editedKeys}
          mealType={mealType}
          date={date}
          saving={saving}
          onFieldChange={onFieldChange}
          onEditCalories={onEditCalories}
          onEditNutrition={onEditNutrition}
          onMealTypeChange={onMealTypeChange}
          onDateChange={onDateChange}
          onCancel={onCancel}
          onSave={onSave}
          onManual={onManual}
        />
      ) : status === 'error' ? (
        <RecognizeError message={errorMsg} onRetry={onRetry} onManual={onManual} />
      ) : status === 'analyzing' || status === 'compressing' ? (
        <RecognizeLoadingFooter />
      ) : null}
    </div>
  )
}
