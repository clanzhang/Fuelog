import { motion } from 'framer-motion'
import NutritionGrid from './NutritionGrid'
import FoodDetailHeader from './food/FoodDetailHeader'
import FoodHero from './food/FoodHero'
import FoodTipCard from './food/FoodTipCard'
import FoodEditForm from './food/FoodEditForm'
import FoodActionButtons from './food/FoodActionButtons'
import useFoodDetail from '../hooks/useFoodDetail'
import { useNavigate } from 'react-router-dom'

/**
 * 食物详情页（组合组件）
 * 内部调用 useFoodDetail Hook 管理数据与逻辑，
 * 组合 顶部栏 / 圆形照片 / 营养成分 / AI Tips / 编辑表单 / 操作按钮。
 */
export default function FoodDetailScreen() {
  const navigate = useNavigate()
  const {
    food,
    editing,
    mealType,
    setMealType,
    date,
    setDate,
    saved,
    nutritionMap,
    startEdit,
    cancelEdit,
    saveChanges,
    handleDelete,
    goBack,
  } = useFoodDetail()

  if (!food) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-bg">
        <p className="text-ink/45">未找到该食物</p>
        <button onClick={() => navigate('/diary')} className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
          返回
        </button>
      </div>
    )
  }

  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-bg pb-10">
      <FoodDetailHeader onBack={goBack} />

      {saved && (
        <div className="sticky top-16 z-10 mx-5 rounded-2xl bg-green-50 px-4 py-3 text-center text-xs font-semibold text-green-600">
          已保存修改 ✅
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5">
        <FoodHero food={food} />

        {/* 营养素六宫格（只读，无提示、不可点击） */}
        <div className="mt-6">
          <p className="mb-2 px-1 text-sm font-bold text-ink">营养成分</p>
          <NutritionGrid nutrition={nutritionMap} />
        </div>

        <FoodTipCard tips={food.tips} />

        {/* 编辑模式：仅修改餐类和日期 */}
        {editing && (
          <FoodEditForm
            mealType={mealType}
            onMealTypeChange={setMealType}
            date={date}
            onDateChange={setDate}
          />
        )}

        <FoodActionButtons
          editing={editing}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSave={saveChanges}
          onDelete={handleDelete}
        />
      </motion.div>
    </div>
  )
}
