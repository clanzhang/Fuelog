import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Page from '../components/Page'
import SolarIcon from '../components/SolarIcon'
import FoodStickerCard from '../components/FoodStickerCard'
import { useData, todayStr } from '../context/DataContext'
import { MEAL_LABEL, type MealType } from '../types'
import { useNavigate } from 'react-router-dom'

function getWeekDates(anchor: string): { date: string; day: number; weekday: string; isToday: boolean }[] {
  const d = new Date(anchor + 'T00:00:00')
  const mondayOffset = (d.getDay() + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - mondayOffset)
  const weekdays = ['一', '二', '三', '四', '五', '六', '日']
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday)
    dt.setDate(monday.getDate() + i)
    const iso = dt.toISOString().slice(0, 10)
    return {
      date: iso,
      day: dt.getDate(),
      weekday: weekdays[i],
      isToday: iso === todayStr(),
    }
  })
}

export default function DiaryPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(todayStr())
  const week = useMemo(() => getWeekDates(selected), [selected])
  const { settings, deleteFood, getFoodsByDate } = useData()

  const dayFoods = getFoodsByDate(selected)
  const consumed = dayFoods.reduce((s, f) => s + f.calories, 0)
  const remaining = settings.dailyCalorieGoal - consumed

  return (
    <Page>
      {/* 标题 */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-ink">饮食日记</h1>
          <p className="mt-0.5 text-sm font-medium text-ink/45">记录每一口健康</p>
        </div>
        <SolarIcon name="gallery" size={22} className="text-primary" />
      </div>

      {/* 日期选择条 */}
      <div className="no-scrollbar -mx-5 mb-5 flex gap-2 overflow-x-auto px-5">
        {week.map((d) => {
          const active = d.date === selected
          return (
            <motion.button
              key={d.date}
              onClick={() => setSelected(d.date)}
              whileTap={{ scale: 0.9 }}
              animate={{ scale: active ? 1 : 0.92 }}
              className={`flex min-w-[52px] flex-col items-center rounded-2xl py-2.5 ${
                active ? 'bg-primary text-white shadow-fab' : 'bg-surface text-ink'
              }`}
            >
              <span className={`text-[10px] font-semibold ${active ? 'text-white/70' : 'text-ink/40'}`}>
                {d.weekday}
              </span>
              <span className="mt-0.5 font-display text-lg font-extrabold">{d.day}</span>
              {d.isToday && <span className={`mt-0.5 h-1 w-1 rounded-full ${active ? 'bg-white' : 'bg-primary'}`} />}
            </motion.button>
          )
        })}
      </div>

      {/* 总摄入横幅 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex items-center justify-between rounded-3xl bg-surface px-6 py-5 shadow-card"
      >
        <div>
          <p className="text-xs font-semibold text-ink/45">总摄入 (kcal)</p>
          <p className="mt-1 font-display text-[28px] font-extrabold leading-none text-ink">
            {consumed}
            <span className="text-lg font-bold text-ink/30"> / {settings.dailyCalorieGoal}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-primary-soft px-3 py-2">
          <SolarIcon name="fire" size={16} className="text-accent-orange" />
          <span className="text-xs font-bold text-primary">剩 {Math.max(remaining, 0)} kcal</span>
        </div>
      </motion.div>

      {/* 食物记录网格 */}
      {dayFoods.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {dayFoods.map((f, i) => (
            <FoodStickerCard
              key={f.id}
              food={f}
              index={i}
              onClick={() => navigate(`/food/${f.id}`)}
              onDelete={() => deleteFood(f.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-surface py-16 shadow-card">
          <span className="text-5xl">🥗</span>
          <p className="mt-4 font-display text-base font-bold text-ink">今天还没有记录饮食</p>
          <p className="mt-1 text-sm text-ink/45">点击下方 + 添加第一餐</p>
        </div>
      )}

      {/* 餐类汇总（可选显示） */}
      {dayFoods.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => {
            const items = dayFoods.filter((f) => f.mealType === m)
            if (items.length === 0) return null
            return (
              <span key={m} className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold text-primary">
                {MEAL_LABEL[m]} {items.reduce((s, f) => s + f.calories, 0)} kcal
              </span>
            )
          })}
        </div>
      )}
    </Page>
  )
}

