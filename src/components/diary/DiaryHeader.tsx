import SolarIcon from '../SolarIcon'

/**
 * 日记页头部：标题 + 图标
 */
export default function DiaryHeader() {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-black text-ink">饮食日记</h1>
        <p className="mt-0.5 text-sm font-medium text-ink/45">记录每一口健康</p>
      </div>
      <SolarIcon name="gallery" size={22} className="text-primary" />
    </div>
  )
}
