import { createContext, useCallback, useContext, useMemo } from 'react'
import type { FavoriteRecipe, FoodEntry, HabitLog, TrainingPlan, UserSettings } from '../types'
import { DEFAULT_SETTINGS, todayStr, uid } from '../types'
import { useLocalStorage } from '../utils/useLocalStorage'

interface DataContextValue {
  // 数据
  foods: FoodEntry[]
  plans: TrainingPlan[]
  settings: UserSettings
  habits: Record<string, HabitLog>
  favorites: FavoriteRecipe[]

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
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [foods, setFoods] = useLocalStorage<FoodEntry[]>('food_entries', [])
  const [plans, setPlans] = useLocalStorage<TrainingPlan[]>('training_plans', [])
  const [settings, setSettings] = useLocalStorage<UserSettings>('user_settings', DEFAULT_SETTINGS)
  const [habits, setHabits] = useLocalStorage<Record<string, HabitLog>>('habits', {})
  const [favorites, setFavorites] = useLocalStorage<FavoriteRecipe[]>('favorite_recipes', [])

  // ---- 食物 ----
  const addFood = useCallback(
    (data: Omit<FoodEntry, 'id' | 'createdAt'>) => {
      const entry: FoodEntry = { ...data, id: uid(), createdAt: new Date().toISOString() }
      setFoods((prev) => [entry, ...prev])
      return entry
    },
    [setFoods],
  )

  const updateFood = useCallback(
    (id: string, patch: Partial<FoodEntry>) => {
      setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
    },
    [setFoods],
  )

  const deleteFood = useCallback(
    (id: string) => {
      setFoods((prev) => prev.filter((f) => f.id !== id))
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
      return plan
    },
    [setPlans],
  )

  const updatePlan = useCallback(
    (id: string, patch: Partial<TrainingPlan>) => {
      setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    },
    [setPlans],
  )

  const deletePlan = useCallback(
    (id: string) => {
      setPlans((prev) => prev.filter((p) => p.id !== id))
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
        return { ...prev, [date]: { ...current, ...patch } }
      })
    },
    [setHabits],
  )

  // ---- 收藏 ----
  const addFavorite = useCallback(
    (data: Omit<FavoriteRecipe, 'savedAt'>) => {
      setFavorites((prev) => {
        if (prev.some((f) => f.id === data.id)) return prev
        return [{ ...data, savedAt: new Date().toISOString() }, ...prev]
      })
    },
    [setFavorites],
  )

  const removeFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => prev.filter((f) => f.id !== id))
    },
    [setFavorites],
  )

  // ---- 设置 ----
  const updateSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }))
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
  }, [setFoods, setPlans, setHabits, setFavorites, setSettings])

  const value = useMemo<DataContextValue>(
    () => ({
      foods,
      plans,
      settings,
      habits,
      favorites,
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
    }),
    [
      foods,
      plans,
      settings,
      habits,
      favorites,
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
