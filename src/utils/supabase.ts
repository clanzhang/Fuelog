// Supabase 客户端初始化
// 在 supabase.com 创建项目后，将 URL 和 anon key 填入 .env
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// 是否已配置 Supabase（未配置时静默降级为纯 localStorage 模式）
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// 获取当前用户 ID（未登录或未配置返回 null）
export async function getUserId(): Promise<string | null> {
  if (!supabase) return null
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user?.id || null
  } catch {
    return null
  }
}
