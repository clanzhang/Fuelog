import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AddEntryPanel from './components/AddEntryPanel'
import TodayPage from './pages/TodayPage'
import DiaryPage from './pages/DiaryPage'
import RecipesPage from './pages/RecipesPage'
import TrainersPage from './pages/TrainersPage'
import ProfilePage from './pages/ProfilePage'
import FoodDetailPage from './pages/FoodDetailPage'
import AiRecognizePage from './pages/AiRecognizePage'
import ManualAddPage from './pages/ManualAddPage'
import IngredientPickPage from './pages/IngredientPickPage'
import RecipeResultPage from './pages/RecipeResultPage'
import LoginPage from './pages/LoginPage'
import { isSupabaseConfigured } from './utils/supabase'
import { useData } from './context/DataContext'

export default function App() {
  const location = useLocation()
  const { isLoggedIn, syncing } = useData()

  const showTabBar = ['/', '/today', '/diary', '/recipes', '/trainers', '/profile'].includes(
    location.pathname,
  )

  // 路由守卫：已配置 Supabase 但未登录 → 显示登录页
  const needsLogin = isSupabaseConfigured && !isLoggedIn && !syncing

  if (needsLogin) {
    return (
      <div className="flex h-full items-center justify-center bg-[#1E1E2E]">
        <div className="relative h-full max-h-[900px] w-full max-w-[430px] overflow-hidden bg-bg shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:my-6 sm:h-[calc(100%-3rem)] sm:rounded-[3rem] sm:border-[10px] sm:border-ink/90">
          <LoginPage />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center bg-[#1E1E2E]">
      {/* 桌面端手机模拟框 */}
      <div className="relative h-full max-h-[900px] w-full max-w-[430px] overflow-hidden bg-bg shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:my-6 sm:h-[calc(100%-3rem)] sm:rounded-[3rem] sm:border-[10px] sm:border-ink/90">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<TodayPage />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/diary" element={<DiaryPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/trainers" element={<TrainersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/food/:id" element={<FoodDetailPage />} />
            <Route path="/recognize" element={<AiRecognizePage />} />
            <Route path="/manual-add" element={<ManualAddPage />} />
            <Route path="/ingredient-pick" element={<IngredientPickPage />} />
            <Route path="/recipe-result" element={<RecipeResultPage />} />
          </Routes>
        </AnimatePresence>

        {/* 底部操作层：文件输入 + TabBar + 添加弹窗 */}
        <AddEntryPanel showTabBar={showTabBar} />
      </div>
    </div>
  )
}
