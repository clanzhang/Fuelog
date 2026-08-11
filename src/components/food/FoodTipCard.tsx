import SolarIcon from '../SolarIcon'

interface FoodTipCardProps {
  tips?: string
}

/**
 * AI Tips 提示卡
 */
export default function FoodTipCard({ tips }: FoodTipCardProps) {
  if (!tips) return null
  return (
    <div className="mt-5 flex gap-3 rounded-2xl border border-primary/10 bg-primary-soft p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        <SolarIcon name="bolt" size={18} />
      </span>
      <div className="flex-1">
        <p className="text-xs font-bold text-primary">AI Tips</p>
        <p className="mt-1 text-xs leading-relaxed text-ink/70">{tips || '暂无备注'}</p>
      </div>
    </div>
  )
}
