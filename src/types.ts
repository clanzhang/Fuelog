export interface Nutrition {
  carbs: number
  protein: number
  fat: number
  fiber: number
  sugar: number
  salt: number
}

export interface FoodItem {
  id: string
  name: string
  emoji: string
  image: string
  calories: number
  amount: string
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  time: string
  nutrition: Nutrition
  aiTip?: string
}

export interface DayStat {
  date: string
  consumed: number
  burned: number
  carbs: number
  protein: number
  fat: number
  water: number
}

export interface TrainingPlan {
  id: string
  name: string
  icon: string
  color: string
  duration: number
  warmup: number
  calories: number
  exercises: { name: string; sets: number; reps: string; rest: number }[]
}

export interface Recipe {
  id: string
  name: string
  author: string
  emoji: string
  image: string
  calories: number
  protein: number
  time: number
  tag: string
  liked: boolean
}

export interface WorkoutDay {
  day: string
  burned: number
  isToday: boolean
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
