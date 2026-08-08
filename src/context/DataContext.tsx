import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { FavoriteRecipe, FoodEntry, HabitLog, TrainingPlan, UserSettings } from '../types'
import { DEFAULT_SETTINGS, todayStr, uid } from '../types'
import { useLocalStorage } from '../utils/useLocalStorage'
import { supabase, getUserId } from '../utils/supabase'
import {
  fetchFoods,
  fetchPlans,
  fetchHabits,
  fetchFavorites,
  fetchSettings,
  addFoodSync,
  deleteFoodSync,
  addPlanSync,
  deletePlanSync,
  syncHabit,
  addFavoriteSync,
  removeFavoriteSync,
  syncSettings,
  migrateLocalData,
} from '../utils/cloud'

interface DataContextValue {
  // 数据
  foods: FoodEntry[]
  plans: TrainingPlan[]
  settings: UserSettings
  habits: Record<string, HabitLog>
  favorites: FavoriteRecipe[]

  // 云同步状态
  syncing: boolean
  isLoggedIn: boolean
  userName: string | null
  userEmail: string | null

  // 食物
  addFood: (data: Omit<FoodEntry, 'id' | 'createdAt'>) => FoodEntry
  updateFood: (id: string, patch: Partial<FoodEntry>) => void
  deleteFood: (id: string) => void
  getFoodsByDate: (date: string) => FoodEntry[]

  // 训练
  addPlan: (data: Omit<TrainingPlan, 'id' | 'createdAt' | 'completed'>) => TrainingPlan
  updatePlan: (id: string, patch: Partial<TrainingPlan>) => void
  deletePlan: (id: string) => void
  getPlansByDate: (date: string) => TrainingPlan[]

  // 习惯
  updateHabit: (date: string, patch: Partial<HabitLog>) => void

  // 收藏
  addFavorite: (data: Omit<FavoriteRecipe, 'savedAt'>) => void
  removeFavorite: (id: string) => void

  // 设置
  updateSettings: (patch: Partial<UserSettings>) => void

  // 清空
  clearAll: () => void

  // 刷新云端数据（登录状态变化后调用）
  refreshFromCloud: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [foods, setFoods] = useLocalStorage<FoodEntry[]>('food_entries', [])
  const [plans, setPlans] = useLocalStorage<TrainingPlan[]>('training_plans', [])
  const [settings, setSettings] = useLocalStorage<UserSettings>('user_settings', DEFAULT_SETTINGS)
  const [habits, setHabits] = useLocalStorage<Record<string, HabitLog>>('habits', {})
  const [favorites, setFavorites] = useLocalStorage<FavoriteRecipe[]>('favorite_recipes', [])

  // 登录 / 同步状态
  const [syncing, setSyncing] = useState(false)
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { full_name?: string } } | null>(null)
  const initializedRef = useRef(false)

  // 登录后是否已刷新过云端（避免重复）
  const cloudLoadedForUser = useRef<string | null>(null)

  // 刷新云端数据
  const refreshFromCloud = useCallback(async () => {
    if (!supabase) return
    const userId = await getUserId()
    setSyncing(true)
    try {
      // 未登录：清空云端用户态，读本地
      if (!userId) {
        setUser(null)
        setSyncing(false)
        return
      }
      // 已登录：读云端（含迁移）
      await migrateLocalData()
      const [cloudFoods, cloudPlans, cloudHabits, cloudFavs, cloudSettings] = await Promise.all([
        fetchFoods(),
        fetchPlans(),
        fetchHabits(),
        fetchFavorites(),
        fetchSettings(),
      ])
      if (cloudFoods.length > 0) setFoods(cloudFoods)
      if (cloudPlans.length > 0) setPlans(cloudPlans)
      if (Object.keys(cloudHabits).length > 0) setHabits(cloudHabits)
      if (cloudFavs.length > 0) setFavorites(cloudFavs)
      if (cloudSettings) setSettings(cloudSettings)
      cloudLoadedForUser.current = userId
    } catch (e) {
      console.warn('[cloud] 云端刷新失败，使用本地缓存', e)
    } finally {
      setSyncing(false)
    }
  }, [setFoods, setPlans, setHabits, setFavorites, setSettings])

  // 监听登录状态 + 初始化
  useEffect(() => {
    if (!supabase) return
    let active = true
    const client = supabase

    const init = async () => {
      const {
        data: { user: u },
      } = await client.auth.getUser()
      if (!active) return
      if (u) {
        setUser(u)
        await refreshFromCloud()
      } else {
        setUser(null)
      }
      initializedRef.current = true
    }

    init()

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u && cloudLoadedForUser.current !== u.id) {
        // 登录事件：刷新云端
        refreshFromCloud()
      } else if (!u) {
        setUser(null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- 食物 ----
  const addFood = useCallback(
    (data: Omit<FoodEntry, 'id' | 'createdAt'>) => {
      const entry: FoodEntry = { ...data, id: uid(), createdAt: new Date().toISOString() }
      setFoods((prev) => [entry, ...prev])
      // 云同步（不阻塞 UI）
      addFoodSync(entry).catch(() => {})
      return entry
    },
    [setFoods],
  )

  const updateFood = useCallback(
    (id: string, patch: Partial<FoodEntry>) => {
      setFoods((prev) => {
        const next = prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
        const changed = next.find((f) => f.id === id)
        if (changed && supabase) {
          // 更新云端（重新 upsert 该条）
          supabase.from('food_entries').update({ ...changed }).eq('id', id).then((r) => {
            if (r.error) console.warn('[cloud] food update failed', r.error)
          })
        }
        return next
      })
    },
    [setFoods],
  )

  const deleteFood = useCallback(
    (id: string) => {
      setFoods((prev) => prev.filter((f) => f.id !== id))
      deleteFoodSync(id).catch(() => {})
    },
    [setFoods],
  )

  const getFoodsByDate = useCallback(
    (date: string) => foods.filter((f) => f.date === date),
    [foods],
  )

  // ---- 训练 ----
  const addPlan = useCallback(
    (data: Omit<TrainingPlan, 'id' | 'createdAt' | 'completed'>) => {
      const plan: TrainingPlan = {
        ...data,
        id: uid(),
        completed: false,
        createdAt: new Date().toISOString(),
      }
      setPlans((prev) => [plan, ...prev])
      addPlanSync(plan).catch(() => {})
      return plan
    },
    [setPlans],
  )

  const updatePlan = useCallback(
    (id: string, patch: Partial<TrainingPlan>) => {
      setPlans((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
        const changed = next.find((p) => p.id === id)
        if (changed && supabase) {
          supabase.from('training_plans').update({ ...changed }).eq('id', id).then((r) => {
            if (r.error) console.warn('[cloud] plan update failed', r.error)
          })
        }
        return next
      })
    },
    [setPlans],
  )

  const deletePlan = useCallback(
    (id: string) => {
      setPlans((prev) => prev.filter((p) => p.id !== id))
      deletePlanSync(id).catch(() => {})
    },
    [setPlans],
  )

  const getPlansByDate = useCallback(
    (date: string) => plans.filter((p) => p.date === date),
    [plans],
  )

  // ---- 习惯 ----
  const updateHabit = useCallback(
    (date: string, patch: Partial<HabitLog>) => {
      setHabits((prev) => {
        const current: HabitLog = prev[date] ?? {
          waterIntake: 0,
          waterType: 'water',
          exerciseMinutes: 0,
          exerciseType: '慢跑',
        }
        const next = { ...prev, [date]: { ...current, ...patch } }
        syncHabit(date, next[date]).catch(() => {})
        return next
      })
    },
    [setHabits],
  )

  // ---- 收藏 ----
  const addFavorite = useCallback(
    (data: Omit<FavoriteRecipe, 'savedAt'>) => {
      setFavorites((prev) => {
        if (prev.some((f) => f.id === data.id)) return prev
        const fav: FavoriteRecipe = { ...data, savedAt: new Date().toISOString() }
        addFavoriteSync(fav).catch(() => {})
        return [fav, ...prev]
      })
    },
    [setFavorites],
  )

  const removeFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => prev.filter((f) => f.id !== id))
      removeFavoriteSync(id).catch(() => {})
    },
    [setFavorites],
  )

  // ---- 设置 ----
  const updateSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch }
        syncSettings(next).catch(() => {})
        return next
      })
    },
    [setSettings],
  )

  // ---- 清空 ----
  const clearAll = useCallback(() => {
    setFoods([])
    setPlans([])
    setHabits({})
    setFavorites([])
    setSettings(DEFAULT_SETTINGS)
    // 清云端
    const userIdPromise = getUserId()
    userIdPromise.then((uid2) => {
      if (supabase && uid2) {
        supabase.from('food_entries').delete().eq('user_id', uid2).then((r) => r.error && console.warn(r.error))
        supabase.from('training_plans').delete().eq('user_id', uid2).then((r) => r.error && console.warn(r.error))
        supabase.from('habit_logs').delete().eq('user_id', uid2).then((r) => r.error && console.warn(r.error))
        supabase.from('favorite_recipes').delete().eq('user_id', uid2).then((r) => r.error && console.warn(r.error))
      }
    })
  }, [setFoods, setPlans, setHabits, setFavorites, setSettings])

  const value = useMemo<DataContextValue>(
    () => ({
      foods,
      plans,
      settings,
      habits,
      favorites,
      syncing,
      isLoggedIn: !!user,
      userName: (user?.user_metadata?.full_name as string) || null,
      userEmail: user?.email || null,
      addFood,
      updateFood,
      deleteFood,
      getFoodsByDate,
      addPlan,
      updatePlan,
      deletePlan,
      getPlansByDate,
      updateHabit,
      addFavorite,
      removeFavorite,
      updateSettings,
      clearAll,
      refreshFromCloud,
    }),
    [
      foods,
      plans,
      settings,
      habits,
      favorites,
      syncing,
      user,
      addFood,
      updateFood,
      deleteFood,
      getFoodsByDate,
      addPlan,
      updatePlan,
      deletePlan,
      getPlansByDate,
      updateHabit,
      addFavorite,
      removeFavorite,
      updateSettings,
      clearAll,
      refreshFromCloud,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData 必须在 DataProvider 内使用')
  return ctx
}

export { todayStr }

