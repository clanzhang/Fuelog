import { useRef, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import BottomTabBar from './components/BottomTabBar'
import ActionSheet from './components/ActionSheet'
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
import { compressImage } from './utils/image'
import { isSupabaseConfigured } from './utils/supabase'
import { useData } from './context/DataContext'

export default function App() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isLoggedIn, syncing } = useData()
  // 拍照 / 相册两个独立 input：拍照带 capture，相册不带
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const showTabBar = ['/', '/today', '/diary', '/recipes', '/trainers', '/profile'].includes(
    location.pathname,
  )

  // 路由守卫：已配置 Supabase 但未登录 → 显示登录页
  const needsLogin = isSupabaseConfigured && !isLoggedIn && !syncing

  // 读取文件 → 压缩 → 带着图片进入识别流程
  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>, source: string) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 允许重复选择同一文件
    if (!file) return
    try {
      const base64 = await compressImage(file)
      navigate('/recognize', { state: { imageData: base64, source } })
    } catch {
      console.warn('[App] 图片处理失败', e)
    }
  }

  const handleSelect = (key: string) => {
    if (key === 'camera') {
      cameraInputRef.current?.click()
    } else if (key === 'gallery') {
      galleryInputRef.current?.click()
    } else if (key === 'manual') {
      navigate('/manual-add')
    }
  }

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

        {/* 拍照 input：capture 调起系统相机 */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handlePick(e, 'camera')}
        />
        {/* 相册 input：不带 capture */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePick(e, 'gallery')}
        />

        {showTabBar && (
          <BottomTabBar
            onFab={() => {
              setSheetOpen(true)
            }}
          />
        )}

        <ActionSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="添加饮食记录"
          options={[
            { key: 'camera', emoji: '📷', label: '拍照识别' },
            { key: 'gallery', emoji: '🖼️', label: '相册选择' },
            { key: 'search', emoji: '🔍', label: '搜索食物' },
            { key: 'manual', emoji: '✏️', label: '手动输入' },
          ]}
          onSelect={handleSelect}
        />
      </div>
    </div>
  )
}
