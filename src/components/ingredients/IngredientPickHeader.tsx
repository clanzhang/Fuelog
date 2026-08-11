import SolarIcon from '../SolarIcon'

interface IngredientPickHeaderProps {
  onBack: () => void
}

/**
 * 选食材做菜页顶部栏
 */
export default function IngredientPickHeader({ onBack }: IngredientPickHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-bg/80 px-5 py-4 backdrop-blur-lg">
      <button
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-card"
      >
        <SolarIcon name="arrow-left" size={20} />
      </button>
      <span className="font-display text-sm font-bold text-ink">选食材做菜</span>
      <div className="h-10 w-10" />
    </div>
  )
}
