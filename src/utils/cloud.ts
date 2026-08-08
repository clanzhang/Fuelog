// 云同步层：Supabase 优先，localStorage 兜底
// 设计：所有操作先写/读 localStorage（即时响应），再异步同步到云端
import { supabase, getUserId } from './supabase'
import { storage } from './storage'
import type { FavoriteRecipe, FoodEntry, HabitLog, TrainingPlan, UserSettings } from '../types'

const LOCAL_KEYS = {
  food: 'food_entries',
  plans: 'training_plans',
  settings: 'user_settings',
  habits: 'habits',
  favorites: 'favorite_recipes',
} as const

// ---------- 通用 ----------

/** 记录某条数据是否已同步（防止重复上传）。用云端主键 id 去重。 */
const syncFlagKey = (table: string, id: string) => `fuelog_synced_${table}_${id}`

function markSynced(table: string, id: string) {
  try {
    localStorage.setItem(syncFlagKey(table, id), '1')
  } catch {
    /* ignore */
  }
}

function isSynced(table: string, id: string): boolean {
  try {
    return localStorage.getItem(syncFlagKey(table, id)) === '1'
  } catch {
    return false
  }
}

// ---------- 饮食记录 ----------

export async function fetchFoods(): Promise<FoodEntry[]> {
  const userId = await getUserId()
  if (supabase && userId) {
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error && data) {
      const entries = data.map(mapRowToFood)
      storage.set(LOCAL_KEYS.food, entries)
      return entries
    }
  }
  return storage.get<FoodEntry[]>(LOCAL_KEYS.food, [])
}

export async function addFoodSync(entry: FoodEntry): Promise<void> {
  const userId = await getUserId()
  if (supabase && userId) {
    const { error } = await supabase.from('food_entries').insert({ ...entry, user_id: userId })
    if (!error) markSynced('food', entry.id)
  }
}

export async function deleteFoodSync(id: string): Promise<void> {
  const userId = await getUserId()
  if (supabase && userId) {
    await supabase.from('food_entries').delete().eq('id', id).eq('user_id', userId)
  }
  try {
    localStorage.removeItem(syncFlagKey('food', id))
  } catch {
    /* ignore */
  }
}

// ---------- 训练计划 ----------

export async function fetchPlans(): Promise<TrainingPlan[]> {
  const userId = await getUserId()
  if (supabase && userId) {
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error && data) {
      const plans = data.map(mapRowToPlan)
      storage.set(LOCAL_KEYS.plans, plans)
      return plans
    }
  }
  return storage.get<TrainingPlan[]>(LOCAL_KEYS.plans, [])
}

export async function addPlanSync(plan: TrainingPlan): Promise<void> {
  const userId = await getUserId()
  if (supabase && userId) {
    const { error } = await supabase.from('training_plans').insert({ ...plan, user_id: userId })
    if (!error) markSynced('plan', plan.id)
  }
}

export async function deletePlanSync(id: string): Promise<void> {
  const userId = await getUserId()
  if (supabase && userId) {
    await supabase.from('training_plans').delete().eq('id', id).eq('user_id', userId)
  }
  try {
    localStorage.removeItem(syncFlagKey('plan', id))
  } catch {
    /* ignore */
  }
}

// ---------- 习惯打卡（按 date 维度 upsert） ----------

export async function fetchHabits(): Promise<Record<string, HabitLog>> {
  const userId = await getUserId()
  if (supabase && userId) {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
    if (!error && data) {
      const map: Record<string, HabitLog> = {}
      data.forEach((row) => {
        map[row.date] = {
          waterIntake: Number(row.water_intake ?? 0),
          waterType: row.water_type ?? 'water',
          exerciseMinutes: Number(row.exercise_minutes ?? 0),
          exerciseType: row.exercise_type ?? '',
        }
      })
      storage.set(LOCAL_KEYS.habits, map)
      return map
    }
  }
  return storage.get<Record<string, HabitLog>>(LOCAL_KEYS.habits, {})
}

export async function syncHabit(date: string, habit: HabitLog): Promise<void> {
  const userId = await getUserId()
  if (supabase && userId) {
    await supabase.from('habit_logs').upsert(
      {
        user_id: userId,
        date,
        water_intake: habit.waterIntake,
        water_type: habit.waterType,
        exercise_minutes: habit.exerciseMinutes,
        exercise_type: habit.exerciseType,
      },
      { onConflict: 'user_id,date' },
    )
  }
}

// ---------- 收藏食谱 ----------

export async function fetchFavorites(): Promise<FavoriteRecipe[]> {
  const userId = await getUserId()
  if (supabase && userId) {
    const { data, error } = await supabase
      .from('favorite_recipes')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })
    if (!error && data) {
      const favs = data.map(mapRowToFavorite)
      storage.set(LOCAL_KEYS.favorites, favs)
      return favs
    }
  }
  return storage.get<FavoriteRecipe[]>(LOCAL_KEYS.favorites, [])
}

export async function addFavoriteSync(fav: FavoriteRecipe): Promise<void> {
  const userId = await getUserId()
  if (supabase && userId) {
    const { error } = await supabase
      .from('favorite_recipes')
      .insert({ ...fav, user_id: userId })
    if (!error) markSynced('favorite', fav.id)
  }
}

export async function removeFavoriteSync(id: string): Promise<void> {
  const userId = await getUserId()
  if (supabase && userId) {
    await supabase.from('favorite_recipes').delete().eq('id', id).eq('user_id', userId)
  }
  try {
    localStorage.removeItem(syncFlagKey('favorite', id))
  } catch {
    /* ignore */
  }
}

// ---------- 用户设置 ----------

export async function fetchSettings(): Promise<UserSettings | null> {
  const userId = await getUserId()
  if (supabase && userId) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (!error && data) {
      const settings = mapRowToSettings(data)
      storage.set(LOCAL_KEYS.settings, settings)
      return settings
    }
  }
  return null
}

export async function syncSettings(settings: UserSettings): Promise<void> {
  const userId = await getUserId()
  if (supabase && userId) {
    await supabase.from('user_settings').upsert(
      {
        user_id: userId,
        daily_calorie_goal: settings.dailyCalorieGoal,
        carbs_goal: settings.carbsGoal,
        protein_goal: settings.proteinGoal,
        fat_goal: settings.fatGoal,
        water_goal: settings.waterGoal,
        exercise_goal: settings.exerciseGoal,
        unit: settings.unit,
        user_name: settings.userName,
      },
      { onConflict: 'user_id' },
    )
  }
}

// ---------- 数据迁移：登录后把 localStorage 旧数据上传到云端 ----------

export async function migrateLocalData(): Promise<void> {
  if (!supabase) return
  const userId = await getUserId()
  if (!userId) return
  try {
    if (localStorage.getItem('fuelog_migrated') === userId) return

    // 饮食记录（仅迁移未同步过的）
    const foods = storage.get<FoodEntry[]>(LOCAL_KEYS.food, [])
    const unsyncedFoods = foods.filter((f) => !isSynced('food', f.id))
    if (unsyncedFoods.length > 0) {
      const { error } = await supabase
        .from('food_entries')
        .insert(unsyncedFoods.map((f) => ({ ...f, user_id: userId })))
      if (!error) unsyncedFoods.forEach((f) => markSynced('food', f.id))
    }

    // 训练计划
    const plans = storage.get<TrainingPlan[]>(LOCAL_KEYS.plans, [])
    const unsyncedPlans = plans.filter((p) => !isSynced('plan', p.id))
    if (unsyncedPlans.length > 0) {
      const { error } = await supabase
        .from('training_plans')
        .insert(unsyncedPlans.map((p) => ({ ...p, user_id: userId })))
      if (!error) unsyncedPlans.forEach((p) => markSynced('plan', p.id))
    }

    // 习惯打卡
    const habits = storage.get<Record<string, HabitLog>>(LOCAL_KEYS.habits, {})
    const habitRows = Object.entries(habits).map(([date, h]) => ({
      user_id: userId,
      date,
      water_intake: h.waterIntake,
      water_type: h.waterType,
      exercise_minutes: h.exerciseMinutes,
      exercise_type: h.exerciseType,
    }))
    if (habitRows.length > 0) {
      await supabase.from('habit_logs').upsert(habitRows, { onConflict: 'user_id,date' })
    }

    // 收藏食谱
    const favs = storage.get<FavoriteRecipe[]>(LOCAL_KEYS.favorites, [])
    const unsyncedFavs = favs.filter((f) => !isSynced('favorite', f.id))
    if (unsyncedFavs.length > 0) {
      const { error } = await supabase
        .from('favorite_recipes')
        .insert(unsyncedFavs.map((f) => ({ ...f, user_id: userId })))
      if (!error) unsyncedFavs.forEach((f) => markSynced('favorite', f.id))
    }

    localStorage.setItem('fuelog_migrated', userId)
  } catch (e) {
    console.warn('[cloud] 数据迁移失败，稍后重试', e)
  }
}

// ---------- 行映射（snake_case → camelCase） ----------

function mapRowToFood(row: Record<string, unknown>): FoodEntry {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    emoji: row.emoji ? String(row.emoji) : undefined,
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    calories: Number(row.calories ?? 0),
    carbs: Number(row.carbs ?? 0),
    protein: Number(row.protein ?? 0),
    fat: Number(row.fat ?? 0),
    fiber: Number(row.fiber ?? 0),
    sugar: Number(row.sugar ?? 0),
    sodium: Number(row.sodium ?? 0),
    tips: String(row.tips ?? ''),
    mealType: (row.meal_type as FoodEntry['mealType']) ?? 'lunch',
    date: String(row.date ?? ''),
    createdAt: String(row.created_at ?? ''),
  }
}

function mapRowToPlan(row: Record<string, unknown>): TrainingPlan {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    icon: String(row.icon ?? 'dumbbell'),
    time: row.time ? String(row.time) : '10:00',
    duration: Number(row.duration ?? 0),
    warmup: Number(row.warmup ?? 0),
    caloriesBurned: Number(row.calories_burned ?? 0),
    date: String(row.date ?? ''),
    completed: Boolean(row.completed),
    createdAt: String(row.created_at ?? ''),
  }
}

function mapRowToFavorite(row: Record<string, unknown>): FavoriteRecipe {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    author: String(row.author ?? ''),
    emoji: row.emoji ? String(row.emoji) : undefined,
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    calories: Number(row.calories ?? 0),
    category: String(row.category ?? ''),
    savedAt: String(row.saved_at ?? ''),
  }
}

function mapRowToSettings(row: Record<string, unknown>): UserSettings {
  return {
    dailyCalorieGoal: Number(row.daily_calorie_goal ?? 2000),
    carbsGoal: Number(row.carbs_goal ?? 250),
    proteinGoal: Number(row.protein_goal ?? 120),
    fatGoal: Number(row.fat_goal ?? 65),
    waterGoal: Number(row.water_goal ?? 2),
    exerciseGoal: Number(row.exercise_goal ?? 60),
    unit: row.unit === 'kJ' ? 'kJ' : 'kcal',
    userName: String(row.user_name ?? ''),
  }
}
