import { useState } from 'react'
import { motion } from 'framer-motion'
import SolarIcon from '../components/SolarIcon'
import { supabase, isSupabaseConfigured } from '../utils/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleLogin = async () => {
    if (!supabase) return
    setLoading(true)
    setMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg(error.message)
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!supabase) return
    setLoading(true)
    setMsg('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMsg(error.message)
    else setMsg('注册成功，请查收验证邮件')
    setLoading(false)
  }

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[380px]"
      >
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-4xl shadow-fab">
            🔥
          </div>
          <h1 className="mt-4 font-display text-3xl font-black text-ink">Fuelog</h1>
          <p className="mt-1 text-sm font-medium text-ink/45">登录以同步你的健康数据</p>
        </div>

        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-2xl bg-surface px-4 py-3.5 text-sm outline-none shadow-card focus:ring-2 focus:ring-primary/40"
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          className="mb-6 w-full rounded-2xl bg-surface px-4 py-3.5 text-sm outline-none shadow-card focus:ring-2 focus:ring-primary/40"
        />

        {msg && (
          <p className={`mb-3 text-center text-xs ${msg.includes('成功') ? 'text-green-600' : 'text-rose-500'}`}>
            {msg}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className={`mb-3 w-full rounded-full py-3.5 font-display text-sm font-bold text-white shadow-fab transition active:scale-[0.98] ${
            loading || !email || !password ? 'bg-ink/20' : 'bg-primary'
          }`}
        >
          {loading ? '登录中...' : '登录'}
        </button>
        <button
          onClick={handleRegister}
          disabled={loading || !email || !password}
          className="w-full rounded-full border-2 border-primary py-3.5 font-display text-sm font-bold text-primary transition active:scale-[0.98]"
        >
          注册新账号
        </button>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink/40">
          <SolarIcon name="cloud" size={14} />
          数据将自动备份到云端，多设备同步
        </div>
      </motion.div>
    </div>
  )
}
