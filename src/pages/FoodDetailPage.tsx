import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SolarIcon from '../components/SolarIcon'
import NutritionGrid from '../components/NutritionGrid'
import { FOODS } from '../data/mock'

export default function FoodDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const food = FOODS.find((f) => f.id === id)

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
      {/* 顶部栏 */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-bg/80 px-5 py-4 backdrop-blur-lg">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-card">
          <SolarIcon name="arrow-left" size={20} />
        </button>
        <span className="font-display text-sm font-bold text-ink">食物详情</span>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-card">
          <SolarIcon name="dots" size={20} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5"
      >
        {/* 圆形照片 */}
        <div className="flex flex-col items-center">
          <div className="notebook-bg rounded-full border border-dashed border-primary/20 bg-[#FFFDF6] p-2 shadow-card">
            <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-primary-soft to-bg text-7xl">
              {food.emoji}
            </div>
          </div>
          <h1 className="mt-4 font-display text-2xl font-black text-ink">{food.name}</h1>
          <p className="mt-1 text-sm font-medium text-ink/45">{food.amount}</p>
          <p className="mt-3 font-display text-[28px] font-extrabold text-primary">{food.calories} kcal</p>
        </div>

        {/* 营养素六宫格 */}
        <div className="mt-6">
          <p className="mb-2 px-1 text-sm font-bold text-ink">营养成分</p>
          <NutritionGrid nutrition={food.nutrition} />
        </div>

        {/* AI Tips */}
        {food.aiTip && (
          <div className="mt-5 flex gap-3 rounded-2xl border border-primary/10 bg-primary-soft p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <SolarIcon name="bolt" size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-primary">AI Tips</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/70">{food.aiTip}</p>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-7 flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink/10 bg-surface py-3.5 text-sm font-semibold text-ink">
            <SolarIcon name="edit" size={16} /> 编辑
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-50 py-3.5 text-sm font-semibold text-rose-500">
            <SolarIcon name="trash" size={16} /> 删除
          </button>
        </div>
      </motion.div>
    </div>
  )
}
