import { FLAVOR_OPTIONS, type IngredientOption } from '../../utils/ingredients'

interface FlavorSectionProps {
  flavor: string
  onSelect: (f: string) => void
}

/**
 * Step 3：口味可选（再次点击取消）
 */
export default function FlavorSection({ flavor, onSelect }: FlavorSectionProps) {
  return (
    <div className="mt-5">
      <p className="mb-3 px-1 font-display text-base font-extrabold text-ink">
        3 · 选口味 <span className="text-xs font-medium text-ink/40">（可选）</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {FLAVOR_OPTIONS.map((f: IngredientOption) => (
          <button
            key={f.name}
            onClick={() => onSelect(f.name === flavor ? '' : f.name)}
            className={`flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold transition active:scale-95 ${
              flavor === f.name ? 'bg-primary text-white shadow-fab' : 'bg-surface text-ink/70 shadow-card'
            }`}
          >
            <span>{f.emoji}</span>
            {f.name}
          </button>
        ))}
      </div>
    </div>
  )
}
