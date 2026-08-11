import { useLocation } from 'react-router-dom'
import { isSupabaseConfigured } from '../utils/supabase'
import { useData } from '../context/DataContext'

export interface AppLayout {
  showTabBar: boolean
  needsLogin: boolean
}

const TAB_BAR_PATHS = ['/', '/today', '/diary', '/recipes', '/trainers', '/profile']

/**
 * 应用布局 Hook：
 * 根据当前路由计算是否显示底部 TabBar，
 * 并判断是否需登录（已配置 Supabase 但未登录）。
 */
export default function useAppLayout(): AppLayout {
  const location = useLocation()
  const { isLoggedIn, syncing } = useData()

  const showTabBar = TAB_BAR_PATHS.includes(location.pathname)
  // 路由守卫：已配置 Supabase 但未登录 → 显示登录页
  const needsLogin = isSupabaseConfigured && !isLoggedIn && !syncing

  return { showTabBar, needsLogin }
}
