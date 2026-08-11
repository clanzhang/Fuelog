import { useMemo, useState } from 'react'
import Page from '../components/Page'
import RecipeHeader from '../components/recipes/RecipeHeader'
import RecipeBanner from '../components/recipes/RecipeBanner'
import RecipeSearchBar from '../components/recipes/RecipeSearchBar'
import RecipeGrid from '../components/recipes/RecipeGrid'
import RecipeEmptyState from '../components/recipes/RecipeEmptyState'
import { useData } from '../context/DataContext'
import { useNavigate } from 'react-router-dom'

export default function RecipesPage() {
  const { favorites, removeFavorite } = useData()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('全部')

  // 搜索 + 分类筛选
  const filtered = useMemo(
    () =>
      favorites.filter(
        (r) =>
          (activeTag === '全部' || r.category === activeTag) &&
          (query === '' || r.name.includes(query) || r.category.includes(query)),
      ),
    [favorites, activeTag, query],
  )

  return (
    <Page>
      {/* 顶部标题 */}
      <RecipeHeader />

      {/* "今天做什么" 入口横幅 */}
      <RecipeBanner onClick={() => navigate('/ingredient-pick')} />

      {/* 搜索 + 分类标签（有收藏时才显示） */}
      {favorites.length > 0 && (
        <RecipeSearchBar
          query={query}
          onQueryChange={setQuery}
          activeTag={activeTag}
          onTagChange={setActiveTag}
        />
      )}

      {/* 卡片墙 / 空状态 */}
      {filtered.length > 0 ? (
        <RecipeGrid recipes={filtered} onRemove={removeFavorite} />
      ) : (
        <RecipeEmptyState onGoPick={() => navigate('/ingredient-pick')} />
      )}
    </Page>
  )
}

