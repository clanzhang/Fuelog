import SolarIcon from '../SolarIcon'

export const CATEGORY_TAGS = ['全部', '低卡', '高蛋白', '素食', '快手菜', '减脂餐']

/**
 * 食谱搜索区：搜索框 + 分类标签（胶囊）
 */
export default function RecipeSearchBar({
  query,
  onQueryChange,
  activeTag,
  onTagChange,
}: {
  query: string
  onQueryChange: (v: string) => void
  activeTag: string
  onTagChange: (v: string) => void
}) {
  return (
    <>
      {/* 搜索区（浅灰圆角） */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-gray-100 px-4 py-2.5">
          <SolarIcon name="search" size={18} className="text-ink/35" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="搜索食谱..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
          />
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-ink/50">
          <SolarIcon name="filters" size={18} />
        </button>
      </div>

      {/* 分类标签栏（胶囊） */}
      <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
        {CATEGORY_TAGS.map((t) => (
          <button
            key={t}
            onClick={() => onTagChange(t)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              activeTag === t
                ? 'bg-primary text-white shadow-fab'
                : 'border border-ink/10 bg-surface text-ink/55'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </>
  )
}
