import SolarIcon from '../SolarIcon'

interface FoodDetailHeaderProps {
  onBack: () => void
}

/**
 * 食物详情页顶部栏：返回 + 标题 + 占位按钮
 */
export default function FoodDetailHeader({ onBack }: FoodDetailHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-bg/80 px-5 py-4 backdrop-blur-lg">
      <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-card">
        <SolarIcon name="arrow-left" size={20} />
      </button>
      <span className="font-display text-sm font-bold text-ink">食物详情</span>
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-card">
        <SolarIcon name="dots" size={20} />
      </button>
    </div>
  )
}
