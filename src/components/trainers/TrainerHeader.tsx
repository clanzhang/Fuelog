import SolarIcon from '../SolarIcon'

interface TrainerHeaderProps {
  totalBurned: number
  onAdd: () => void
}

/**
 * 训练计划页头部：标题 + 本周累计消耗 + 添加快捷按钮
 */
export default function TrainerHeader({ totalBurned, onAdd }: TrainerHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-black text-ink">训练计划</h1>
        <p className="mt-0.5 text-sm font-medium text-ink/45">
          本周累计消耗 <span className="font-bold text-accent-orange">{totalBurned} kcal</span>
        </p>
      </div>
      <button
        onClick={onAdd}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-fab active:scale-90"
      >
        <SolarIcon name="add" size={22} />
      </button>
    </div>
  )
}
