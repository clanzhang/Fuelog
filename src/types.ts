// 饮食记录
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface FoodEntry {
  id: string
  name: string
  emoji?: string
  imageUrl?: string // base64 图片（压缩后）
  calories: number
  carbs: number
  protein: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  tips: string
  mealType: MealType
  date: string // YYYY-MM-DD
  createdAt: string // ISO
}

// 训练计划
export interface TrainingPlan {
  id: string
  name: string
  icon: string
  time: string // "10:00"
  duration: number
  warmup: number
  caloriesBurned: number
  date: string // YYYY-MM-DD
  completed: boolean
  createdAt: string
}

// 用户设置
export interface UserSettings {
  dailyCalorieGoal: number
  carbsGoal: number
  proteinGoal: number
  fatGoal: number
  waterGoal: number // 升
  exerciseGoal: number // 分钟
  unit: 'kcal' | 'kJ'
  userName: string
}

// 习惯打卡
export interface HabitLog {
  waterIntake: number // 升
  waterType: 'water' | 'tea' | 'coffee'
  exerciseMinutes: number
  exerciseType: string
}

// 收藏食谱
export interface FavoriteRecipe {
  id: string
  name: string
  author: string
  emoji?: string
  imageUrl?: string
  calories: number
  category: string
  savedAt: string
}

export const MEAL_LABEL: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
}

export const MEAL_EMOJI: Record<MealType, string> = {
  breakfast: '☀️',
  lunch: '🍱',
  dinner: '🌙',
  snack: '🍪',
}

export const DEFAULT_SETTINGS: UserSettings = {
  dailyCalorieGoal: 2000,
  carbsGoal: 250,
  proteinGoal: 120,
  fatGoal: 65,
  waterGoal: 2.0,
  exerciseGoal: 60,
  unit: 'kcal',
  userName: '用户小明',
}

// 训练图标预设
export const TRAINING_ICONS = ['dumbbell', 'running', 'basketball', 'medal', 'walking', 'fire', 'battery', 'heart-pulse']

// 运动类型
export const WATER_TYPES = ['water', 'tea', 'coffee'] as const
export const EXERCISE_TYPES = ['慢跑', '跑步', '骑行', '力量', '瑜伽', 'HIIT']

// 日期工具
export function todayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

