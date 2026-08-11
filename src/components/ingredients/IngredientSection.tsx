import { INGREDIENT_GROUPS, type IngredientGroup } from '../../utils/ingredients'

interface IngredientSectionProps {
  selected: Record<string, string[]>
  onToggle: (group: string, name: string) => void
}

/**
 * Step 1：食材分组多选
 */
export default function IngredientSection({ selected, onToggle }: IngredientSectionProps) {
  return (
    <div className="mt-5">
      <p className="mb-3 px-1 font-display text-base font-extrabold text-ink">
        1 · 选食材 <span className="text-xs font-medium text-ink/40">（可多选）</span>
      </p>
      {INGREDIENT_GROUPS.map((group: IngredientGroup) => (
        <div key={group.title} className="mb-4">
          <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold text-ink/50">
            <span>{group.emoji}</span>
            {group.title}
            {group.note && <span className="font-normal text-ink/35">（{group.note}）</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => {
              const active = (selected[group.title] ?? []).includes(item.name)
              return (
                <button
                  key={item.name}
                  onClick={() => onToggle(group.title, item.name)}
                  className={`flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold transition active:scale-95 ${
                    active ? 'bg-primary text-white shadow-fab' : 'bg-surface text-ink/70 shadow-card'
                  }`}
                >
                  <span>{item.emoji}</span>
                  {item.name}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
