import { useMemo, useState } from 'react'
import { useData, todayStr } from '../context/DataContext'
import type { TrainingPlan } from '../types'

const WEEK_LABEL = ['一', '二', '三', '四', '五', '六', '日']

export interface TrainerFormValues {
  name: string
  icon: string
  time: string
  duration: string
  warmup: string
  calories: string
  date: string
}

export interface WeekChartItem {
  day: string
  burned: number
  isToday: boolean
}

export interface TrainerPlans {
  // 表单状态
  formOpen: boolean
  setFormOpen: (v: boolean) => void
  values: TrainerFormValues
  updateForm: (patch: Partial<TrainerFormValues>) => void

  // 数据与图表
  plans: TrainingPlan[]
  weekChart: WeekChartItem[]
  totalBurned: number

  // 操作
  submitPlan: () => void
  togglePlan: (id: string) => void
  removePlan: (id: string) => void
}

/**
 * 训练计划页核心业务 Hook：
 * 管理添加表单状态、本周消耗柱状图聚合，以及计划的增删改。
 */
export default function useTrainerPlans(): TrainerPlans {
  const { plans, addPlan, deletePlan, updatePlan } = useData()

  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('dumbbell')
  const [time, setTime] = useState('10:00')
  const [duration, setDuration] = useState('30')
  const [warmup, setWarmup] = useState('5')
  const [calories, setCalories] = useState('200')
  const [date, setDate] = useState(todayStr())

  const values: TrainerFormValues = { name, icon, time, duration, warmup, calories, date }
  const updateForm = (patch: Partial<TrainerFormValues>) => {
    if ('name' in patch) setName(patch.name!)
    if ('icon' in patch) setIcon(patch.icon!)
    if ('time' in patch) setTime(patch.time!)
    if ('duration' in patch) setDuration(patch.duration!)
    if ('warmup' in patch) setWarmup(patch.warmup!)
    if ('calories' in patch) setCalories(patch.calories!)
    if ('date' in patch) setDate(patch.date!)
  }

  // 本周柱状图：从训练计划按日期聚合
  const weekChart = useMemo<WeekChartItem[]>(() => {
    const today = new Date(todayStr() + 'T00:00:00')
    const mondayOffset = (today.getDay() + 6) % 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - mondayOffset)
    return WEEK_LABEL.map((label, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      // 用本地日期格式化（toISOString 会按 UTC 偏移一天）
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const burned = plans
        .filter((p) => p.date === iso)
        .reduce((s, p) => s + p.caloriesBurned, 0)
      return { day: label, burned, isToday: iso === todayStr() }
    })
  }, [plans])

  const totalBurned = weekChart.reduce((s, d) => s + d.burned, 0)

  const submitPlan = () => {
    if (!name.trim()) return
    addPlan({
      name: name.trim(),
      icon,
      time,
      duration: Number(duration) || 0,
      warmup: Number(warmup) || 0,
      caloriesBurned: Number(calories) || 0,
      date,
    })
    setFormOpen(false)
    setName('')
    setIcon('dumbbell')
    setDuration('30')
    setWarmup('5')
    setCalories('200')
  }

  const togglePlan = (id: string) => {
    const p = plans.find((x) => x.id === id)
    if (p) updatePlan(id, { completed: !p.completed })
  }

  const removePlan = (id: string) => deletePlan(id)

  return {
    formOpen,
    setFormOpen,
    values,
    updateForm,
    plans,
    weekChart,
    totalBurned,
    submitPlan,
    togglePlan,
    removePlan,
  }
}
