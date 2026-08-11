import { useMemo, useState } from 'react'
import { useData, todayStr } from '../context/DataContext'
import type { FoodEntry } from '../types'

export interface WeekDate {
  date: string
  day: number
  weekday: string
  isToday: boolean
}

export interface DayDiary {
  selected: string
  setSelected: (d: string) => void
  week: WeekDate[]
  dayFoods: FoodEntry[]
  consumed: number
  remaining: number
  calorieGoal: number
  deleteFood: (id: string) => void
}

/** 计算锚点日期所在周的 7 天（周一为起点） */
function getWeekDates(anchor: string): WeekDate[] {
  const d = new Date(anchor + 'T00:00:00')
  const mondayOffset = (d.getDay() + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - mondayOffset)
  const weekdays = ['一', '二', '三', '四', '五', '六', '日']
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday)
    dt.setDate(monday.getDate() + i)
    // 注意：不能用 toISOString()，它会按 UTC 时区偏移一天（东八区会取到前一天）
    // 用本地日期格式化，保证 date 与显示的数字一致
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')
    const iso = `${y}-${m}-${day}`
    return {
      date: iso,
      day: dt.getDate(),
      weekday: weekdays[i],
      isToday: iso === todayStr(),
    }
  })
}

/**
 * 饮食日记页核心业务 Hook：
 * 管理所选日期、周日期条数据，以及当日食物列表与热量统计。
 */
export default function useDayDiary(): DayDiary {
  const { settings, deleteFood, getFoodsByDate } = useData()
  const [selected, setSelected] = useState(todayStr())
  const week = useMemo(() => getWeekDates(selected), [selected])

  const dayFoods = getFoodsByDate(selected)
  const consumed = dayFoods.reduce((s, f) => s + f.calories, 0)
  const remaining = settings.dailyCalorieGoal - consumed

  return {
    selected,
    setSelected,
    week,
    dayFoods,
    consumed,
    remaining,
    calorieGoal: settings.dailyCalorieGoal,
    deleteFood,
  }
}
