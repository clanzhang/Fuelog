interface GenerateButtonProps {
  allSelected: string[]
  canGenerate: boolean
  hasTool: boolean
  onGenerate: () => void
}

/**
 * 底部生成食谱按钮 + 提示
 */
export default function GenerateButton({ allSelected, canGenerate, hasTool, onGenerate }: GenerateButtonProps) {
  return (
    <div className="mt-7 flex flex-col items-center gap-2">
      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className={`w-full rounded-full py-4 font-display text-sm font-bold transition ${
          canGenerate
            ? 'bg-primary text-white shadow-fab active:scale-[0.98]'
            : 'bg-ink/10 text-ink/35'
        }`}
      >
        {allSelected.length > 0 ? `🍳 生成食谱（已选 ${allSelected.length} 种食材）` : '先选一些食材吧'}
      </button>
      {!hasTool && allSelected.length > 0 && (
        <p className="text-xs text-ink/40">还需要选择一个厨具</p>
      )}
    </div>
  )
}
