import AppRoutes from './components/AppRoutes'
import PhoneFrame from './components/PhoneFrame'
import AddEntryPanel from './components/AddEntryPanel'
import LoginPage from './pages/LoginPage'
import useAppLayout from './hooks/useAppLayout'

export default function App() {
  const { showTabBar, needsLogin } = useAppLayout()

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
