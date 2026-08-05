import { useState } from 'react'
import { motion } from 'framer-motion'
import Page, { PageHeader } from '../components/Page'
import SolarIcon from '../components/SolarIcon'
import ProgressRing from '../components/ProgressRing'
import CalendarModal from '../components/CalendarModal'
import { useData, todayStr } from '../context/DataContext'
import { EXERCISE_TYPES, WATER_TYPES, type HabitLog } from '../types'
import { useNavigate } from 'react-router-dom'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatSubtitle(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDate()
  const weekday = WEEKDAYS[d.getDay()]
  const month = d.toLocaleString('en-US', { month: 'short' })
  return `${month} ${day} · ${weekday}`
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 20 } },
}

const WATER_LABEL: Record<string, string> = { water: '水', tea: '茶', coffee: '咖啡' }
const WATER_ICON: Record<string, string> = { water: 'water', tea: 'tea', coffee: 'coffee' }

export default function TodayPage() {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selected, setSelected] = useState(todayStr())
  const navigate = useNavigate()
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

  const calPercent = consumed / settings.dailyCalorieGoal
  const datesWithData = [...new Set([...foods.map((f) => f.date), ...plans.map((p) => p.date)])]

  const addWater = () => {
    updateHabit(selected, {
      ...dayHabit,
      waterIntake: Math.min(4, Math.round((dayHabit.waterIntake + 0.5) * 10) / 10),
    })
  }
  const addExercise = (minutes = 15) => {
    updateHabit(selected, {
      ...dayHabit,
      exerciseMinutes: dayHabit.exerciseMinutes + minutes,
    })
  }

  return (
    <Page>
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <PageHeader
            title="Today"
            subtitle={formatSubtitle(selected)}
            right={
              <button
                onClick={() => setCalendarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-primary shadow-card"
              >
                <SolarIcon name="calendar" size={20} />
              </button>
            }
          />
        </motion.div>

        {/* 每日统计大卡片 */}
        <motion.div
          variants={item}
          className="rounded-[2rem] bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-card"
        >
          <div className="flex items-center gap-5">
            <ProgressRing progress={calPercent} color="#FFFFFF" track="rgba(255,255,255,0.18)">
              <span className="font-display text-3xl font-black leading-none">{consumed}</span>
              <span className="mt-1 text-[11px] text-white/70">/ {settings.dailyCalorieGoal} kcal</span>
            </ProgressRing>
            <div className="flex-1 space-y-4">
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/70">已摄入</span>
                  <span className="font-display text-sm font-bold">{consumed} kcal</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(calPercent * 100, 100)}%` }} />
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/70">运动消耗</span>
                  <span className="font-display text-sm font-bold">{burned} kcal</span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <SolarIcon name="running" size={14} className="text-orange-200" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400" style={{ width: `${Math.min((burned / 600) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 营养素指标 */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: '碳水', val: carbs, goal: settings.carbsGoal },
              { label: '蛋白质', val: protein, goal: settings.proteinGoal },
              { label: '脂肪', val: fat, goal: settings.fatGoal },
            ].map((n) => (
              <div key={n.label} className="rounded-2xl bg-white/10 p-3 text-center">
                <p className="text-[11px] text-white/70">{n.label}</p>
                <p className="mt-1 font-display text-base font-extrabold">
                  {n.val}
                  <span className="text-[10px] font-semibold text-white/60">/{n.goal}g</span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white" style={{ width: `${Math.min((n.val / n.goal) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 习惯追踪 */}
        <motion.div variants={item} className="mt-5 grid grid-cols-2 gap-3">
          {/* 饮水 */}
          <div className="rounded-2xl bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink/50">饮水</span>
              <button onClick={addWater} className="rounded-full bg-sky-50 p-1.5 active:scale-90">
                <SolarIcon name="water" size={18} className="text-sky-400" />
              </button>
            </div>
            <div className="mt-3 flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex h-8 w-6 items-end justify-center rounded-md pb-1 ${
                    i < Math.floor(dayHabit.waterIntake / 0.5)
                      ? 'bg-sky-100 text-sky-500'
                      : 'bg-ink/5 text-ink/30'
                  }`}
                >
                  <SolarIcon name={WATER_ICON[dayHabit.waterType] as never} size={12} />
                </div>
              ))}
            </div>
            <p className="mt-2 font-display text-sm font-bold">
              {dayHabit.waterIntake}L <span className="text-[11px] font-semibold text-ink/40">/ {settings.waterGoal}L Per Day</span>
            </p>
            <div className="mt-2 flex gap-1">
              {WATER_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => updateHabit(selected, { ...dayHabit, waterType: t })}
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    dayHabit.waterType === t
                      ? 'bg-sky-100 text-sky-600'
                      : 'bg-ink/5 text-ink/50'
                  }`}
                >
                  {WATER_LABEL[t]}
                </button>
              ))}
            </div>
          </div>
          {/* 运动 */}
          <div className="rounded-2xl bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink/50">运动</span>
              <button onClick={() => addExercise(15)} className="rounded-full bg-accent-orange/10 p-1.5 active:scale-90">
                <SolarIcon name="running" size={18} className="text-accent-orange" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-orange/10">
                <SolarIcon name="running" size={18} className="text-accent-orange" />
              </div>
              <span className="font-display text-lg font-extrabold">{dayHabit.exerciseMinutes} min</span>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-ink/40">/ {settings.exerciseGoal}min Per Day</p>
            <div className="mt-2 flex gap-1">
              {EXERCISE_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => updateHabit(selected, { ...dayHabit, exerciseType: t })}
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    dayHabit.exerciseType === t
                      ? 'bg-accent-orange/10 text-accent-orange'
                      : 'bg-ink/5 text-ink/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 训练计划列表 */}
        <motion.div variants={item} className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-extrabold text-ink">My Training Plans</h2>
            <button onClick={() => navigate('/trainers')} className="text-xs font-semibold text-primary">
              See All
            </button>
          </div>
          {dayPlans.length > 0 ? (
            <div className="space-y-3">
              {dayPlans.slice(0, 3).map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => navigate('/trainers')}
                  className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left shadow-card ${i % 2 === 0 ? 'bg-primary-soft' : 'bg-[#F8F8FC]'}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <SolarIcon name={p.icon as never} size={24} />
                  </span>
                  <div className="flex-1">
                    <p className="font-display text-sm font-bold text-ink">{p.name}</p>
                    <p className="mt-0.5 text-[11px] text-ink/45">
                      {p.time} · {p.duration} min · 热身 {p.warmup} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-extrabold text-accent-orange">🔥 {p.caloriesBurned}</p>
                    <p className="text-[10px] text-ink/40">kcal</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl bg-surface py-8 shadow-card">
              <span className="text-3xl">💪</span>
              <p className="mt-2 text-sm font-semibold text-ink/60">今天没有训练安排</p>
              <button
                onClick={() => navigate('/trainers')}
                className="mt-3 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white"
              >
                添加训练
              </button>
            </div>
          )}
        </motion.div>

        {/* 全天无记录空状态 */}
        {consumed === 0 && burned === 0 && dayHabit.waterIntake === 0 && dayHabit.exerciseMinutes === 0 && (
          <motion.div variants={item} className="mt-5 flex flex-col items-center rounded-2xl bg-surface py-8 shadow-card">
            <span className="text-4xl">📝</span>
            <p className="mt-2 text-sm font-semibold text-ink/60">今天还没有记录哦，点击下方 + 开始记录吧</p>
          </motion.div>
        )}
      </motion.div>

      <CalendarModal
        open={calendarOpen}
        selected={selected}
        datesWithData={datesWithData}
        onSelect={setSelected}
        onClose={() => setCalendarOpen(false)}
      />
    </Page>
  )
}

