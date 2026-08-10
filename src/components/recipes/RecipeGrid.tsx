import RecipeCard from './RecipeCard'
import type { FavoriteRecipe } from '../../types'

/**
 * 食谱卡片墙（2 列等高网格）
 */
export default function RecipeGrid({
  recipes,
  onRemove,
}: {
  recipes: FavoriteRecipe[]
  onRemove?: (id: string) => void
}) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      {recipes.map((r, i) => (
        <RecipeCard key={r.id} recipe={r} index={i} onRemove={onRemove} />
      ))}
    </div>
  )
}
