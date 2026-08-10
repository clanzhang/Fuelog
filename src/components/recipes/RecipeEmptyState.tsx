import SolarIcon from '../SolarIcon'

/**
 * 食谱空状态（书本图标 + 提示 + 选食材文字链接）
 */
export default function RecipeEmptyState({ onGoPick }: { onGoPick?: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-3xl bg-surface py-16 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
        <SolarIcon name="book" size={36} className="text-primary" />
      </div>
      <p className="mt-4 font-display text-base font-bold text-ink">还没有收藏食谱</p>
      <p className="mt-1 text-sm text-ink/45">AI 识别结果或食材选菜后可收藏</p>
      {onGoPick && (
        <button
          onClick={onGoPick}
          className="mt-3 text-sm text-ink/40 transition-colors hover:text-primary"
        >
          选食材做菜 →
        </button>
      )}
    </div>
  )
}
