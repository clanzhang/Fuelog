import { useState } from 'react'
import { useData, todayStr } from '../context/DataContext'
import type { HabitLog } from '../types'

export interface DaySummary {
  calendarOpen: boolean
  setCalendarOpen: (v: boolean) => void
  selected: string
  setSelected: (d: string) => void
  dayFoods: ReturnType<ReturnType<typeof useData>['getFoodsByDate']>
  dayPlans: ReturnType<ReturnType<typeof useData>['getPlansByDate']>
  dayHabit: HabitLog
  consumed: number
  burned: number
  carbs: number
  protein: number
  fat: number
  datesWithData: string[]
  updateDayHabit: (patch: Partial<HabitLog>) => void
  settings: ReturnType<typeof useData>['settings']
}

/**
 * 今日页核心业务 Hook：按所选日期聚合
 * 食物/训练/习惯数据，并计算各项营养与热量合计。
 */
export default function useDaySummary(): DaySummary {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selected, setSelected] = useState(todayStr())
  const { foods, plans, settings, habits, getFoodsByDate, getPlansByDate, updateHabit } = useData()

  const dayFoods = getFoodsByDate(selected)
  const dayPlans = getPlansByDate(selected)
  const dayHabit: HabitLog = habits[selected] ?? {
    waterIntake: 0,
    waterType: 'water',
    exerciseMinutes: 0,
    exerciseType: '慢跑',
  }

  const consumed = dayFoods.reduce((s, f) => s + f.calories, 0)
  const burned = dayPlans.reduce((s, p) => s + p.caloriesBurned, 0)
  const carbs = dayFoods.reduce((s, f) => s + f.carbs, 0)
  const protein = dayFoods.reduce((s, f) => s + f.protein, 0)
  const fat = dayFoods.reduce((s, f) => s + f.fat, 0)

  const datesWithData = [...new Set([...foods.map((f) => f.date), ...plans.map((p) => p.date)])]

  const updateDayHabit = (patch: Partial<HabitLog>) => updateHabit(selected, patch)

  return {
    calendarOpen,
    setCalendarOpen,
    selected,
    setSelected,
    dayFoods,
    dayPlans,
    dayHabit,
    consumed,
    burned,
    carbs,
    protein,
    fat,
    datesWithData,
    updateDayHabit,
    settings,
  }
}
