import SolarIcon from '../SolarIcon'

/**
 * 食谱页顶部标题（标题 + 副标题 + 右侧书本图标）
 */
export default function RecipeHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-black text-ink">健康食谱</h1>
        <p className="mt-0.5 text-sm font-medium text-ink/45">收藏你的健康食谱</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
        <SolarIcon name="book" size={20} />
      </div>
    </div>
  )
}
