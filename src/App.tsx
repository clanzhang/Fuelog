import { useLocation } from 'react-router-dom'
import AppRoutes from './components/AppRoutes'
import PhoneFrame from './components/PhoneFrame'
import AddEntryPanel from './components/AddEntryPanel'
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
      <PhoneFrame>
        <LoginPage />
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame>
      <AppRoutes />
      {/* 底部操作层：文件输入 + TabBar + 添加弹窗 */}
      <AddEntryPanel showTabBar={showTabBar} />
    </PhoneFrame>
  )
}
