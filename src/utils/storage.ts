// localStorage 统一封装：所有 key 带 fuelog_ 前缀
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(`fuelog_${key}`)
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
      return fallback
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`fuelog_${key}`, JSON.stringify(value))
    } catch {
      console.warn('localStorage write failed')
    }
  },
  remove(key: string): void {
    localStorage.removeItem(`fuelog_${key}`)
  },
}
