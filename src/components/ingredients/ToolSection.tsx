import { TOOL_OPTIONS, type IngredientOption } from '../../utils/ingredients'

interface ToolSectionProps {
  tool: string
  onSelect: (t: string) => void
}

/**
 * Step 2：厨具单选
 */
export default function ToolSection({ tool, onSelect }: ToolSectionProps) {
  return (
    <div className="mt-2">
      <p className="mb-3 px-1 font-display text-base font-extrabold text-ink">
        2 · 选厨具 <span className="text-xs font-medium text-ink/40">（单选）</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {TOOL_OPTIONS.map((t: IngredientOption) => (
          <button
            key={t.name}
            onClick={() => onSelect(t.name)}
            className={`flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold transition active:scale-95 ${
              tool === t.name ? 'bg-primary text-white shadow-fab' : 'bg-surface text-ink/70 shadow-card'
            }`}
          >
            <span>{t.emoji}</span>
            {t.name}
          </button>
        ))}
      </div>
    </div>
  )
}
