import { useState } from 'react'
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

export default function App() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const showTabBar = ['/', '/today', '/diary', '/recipes', '/trainers', '/profile'].includes(
    location.pathname,
  )

  const handleSelect = (key: string) => {
    if (key === 'camera' || key === 'gallery') {
      navigate(`/recognize?source=${key}`)
    } else if (key === 'manual') {
      navigate('/manual-add')
    }
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
          </Routes>
        </AnimatePresence>

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
