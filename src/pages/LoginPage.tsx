import OtpLoginForm from '../components/OtpLoginForm'
import SupabaseNotConfigured from '../components/SupabaseNotConfigured'
import { isSupabaseConfigured } from '../utils/supabase'

// 登录页：根据 Supabase 配置状态分发到对应组件
export default function LoginPage() {
  if (!isSupabaseConfigured) {
    return <SupabaseNotConfigured />
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-bg px-6">
      <OtpLoginForm />
    </div>
  )
}

