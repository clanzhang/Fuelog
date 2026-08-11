import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import TodayPage from '../pages/TodayPage'
import DiaryPage from '../pages/DiaryPage'
import RecipesPage from '../pages/RecipesPage'
import TrainersPage from '../pages/TrainersPage'
import ProfilePage from '../pages/ProfilePage'
import FoodDetailPage from '../pages/FoodDetailPage'
import AiRecognizePage from '../pages/AiRecognizePage'
import ManualAddPage from '../pages/ManualAddPage'
import IngredientPickPage from '../pages/IngredientPickPage'
import RecipeResultPage from '../pages/RecipeResultPage'

/**
 * 应用路由表（带页面切换动画）
 */
export default function AppRoutes() {
  const location = useLocation()

  return (
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
  )
}
