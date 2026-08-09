import OtpLoginForm from '../components/OtpLoginForm'
import { isSupabaseConfigured } from '../utils/supabase'

// 登录页：仅负责布局与"未配置 Supabase"提示，核心表单逻辑在 OtpLoginForm 组件中
export default function LoginPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-bg px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-4xl">
          🔥
        </div>
        <h1 className="mt-4 font-display text-2xl font-black text-ink">Fuelog</h1>
        <p className="mt-2 text-center text-sm text-ink/45">
          云同步未配置。在 .env 中填写 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 即可启用登录与多设备同步。
        </p>
        <p className="mt-4 text-center text-xs text-ink/35">
          未配置时数据仅保存在本地（localStorage），功能不受影响。
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-bg px-6">
      <OtpLoginForm />
    </div>
  )
}

