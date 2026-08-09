import { useState } from 'react'
import { motion } from 'framer-motion'
import SolarIcon from '../components/SolarIcon'
import { supabase, isSupabaseConfigured } from '../utils/supabase'

// 邮箱验证码一键登录：无需注册密码，输入邮箱 → 收到验证码 → 输入即登录（自动建号）
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email') // 第一步填邮箱，第二步填验证码
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'error' | 'success'>('error')

  const showMsg = (text: string, type: 'error' | 'success' = 'error') => {
    setMsg(text)
    setMsgType(type)
  }

  // 第一步：发送验证码到邮箱
  const handleSendCode = async () => {
    if (!supabase) return
    setLoading(true)
    setMsg('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      showMsg(error.message)
    } else {
      showMsg(`验证码已发送到 ${email}，请查收`, 'success')
      setStep('code')
    }
    setLoading(false)
  }

  // 第二步：输入验证码登录（自动注册，无需密码）
  const handleVerifyCode = async () => {
    if (!supabase) return
    setLoading(true)
    setMsg('')
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    if (error) {
      showMsg(error.message)
    }
    // 成功：onAuthStateChange 会自动触发登录，DataContext 刷新云端数据
    setLoading(false)
  }

  // 返回重填邮箱
  const handleBack = () => {
    setStep('email')
    setCode('')
    setMsg('')
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
          <p className="mt-1 text-sm font-medium text-ink/45">
            {step === 'email' ? '邮箱验证码一键登录' : `验证码已发至 ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <>
            <input
              type="email"
              placeholder="输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
              className="mb-3 w-full rounded-2xl bg-surface px-4 py-3.5 text-sm outline-none shadow-card focus:ring-2 focus:ring-primary/40"
            />
            {msg && (
              <p className={`mb-3 text-center text-xs ${msgType === 'success' ? 'text-green-600' : 'text-rose-500'}`}>
                {msg}
              </p>
            )}
            <button
              onClick={handleSendCode}
              disabled={loading || !email}
              className={`mb-3 w-full rounded-full py-3.5 font-display text-sm font-bold text-white shadow-fab transition active:scale-[0.98] ${
                loading || !email ? 'bg-ink/20' : 'bg-primary'
              }`}
            >
              {loading ? '发送中...' : '发送验证码'}
            </button>
            <p className="text-center text-[11px] leading-relaxed text-ink/40">
              无需注册密码，输入邮箱即可
              <br />
              首次登录将自动创建账号
            </p>
          </>
        ) : (
          <>
            <input
              type="text"
              inputMode="numeric"
              placeholder="输入验证码"
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
              className="mb-3 w-full rounded-2xl bg-surface px-4 py-3.5 text-center font-display text-lg font-bold tracking-[0.3em] text-ink outline-none shadow-card focus:ring-2 focus:ring-primary/40"
            />
            {msg && (
              <p className={`mb-3 text-center text-xs ${msgType === 'success' ? 'text-green-600' : 'text-rose-500'}`}>
                {msg}
              </p>
            )}
            <button
              onClick={handleVerifyCode}
              disabled={loading || code.length < 4}
              className={`mb-3 w-full rounded-full py-3.5 font-display text-sm font-bold text-white shadow-fab transition active:scale-[0.98] ${
                loading || code.length < 4 ? 'bg-ink/20' : 'bg-primary'
              }`}
            >
              {loading ? '登录中...' : '登录'}
            </button>
            <div className="flex items-center justify-between text-[11px] text-ink/40">
              <button onClick={handleBack} className="font-semibold text-primary">
                换邮箱重发
              </button>
              <button onClick={handleSendCode} disabled={loading} className="font-semibold text-primary">
                重新发送
              </button>
            </div>
          </>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink/40">
          <SolarIcon name="cloud" size={14} />
          数据将自动备份到云端，多设备同步
        </div>
      </motion.div>
    </div>
  )
}
