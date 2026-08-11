import { useState } from 'react'
import { motion } from 'framer-motion'
import Page, { PageHeader } from '../components/Page'
import SolarIcon from '../components/SolarIcon'
import CalendarModal from '../components/CalendarModal'
import StatCard from '../components/dashboard/StatCard'
import HabitCard from '../components/dashboard/HabitCard'
import TrainingPlanList from '../components/dashboard/TrainingPlanList'
import EmptyToday from '../components/dashboard/EmptyToday'
import { useData, todayStr } from '../context/DataContext'
import { type HabitLog } from '../types'
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
  show: { transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

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

  const datesWithData = [...new Set([...foods.map((f) => f.date), ...plans.map((p) => p.date)])]

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
        <motion.div variants={item}>
          <StatCard
            consumed={consumed}
            burned={burned}
            carbs={carbs}
            protein={protein}
            fat={fat}
            calorieGoal={settings.dailyCalorieGoal}
            carbsGoal={settings.carbsGoal}
            proteinGoal={settings.proteinGoal}
            fatGoal={settings.fatGoal}
            onGoDiary={() => navigate('/diary')}
            onGoTrainers={() => navigate('/trainers')}
          />
        </motion.div>

        {/* 习惯追踪 */}
        <motion.div variants={item}>
          <HabitCard
            habit={dayHabit}
            waterGoal={settings.waterGoal}
            exerciseGoal={settings.exerciseGoal}
            onUpdate={(patch) => updateHabit(selected, patch)}
          />
        </motion.div>

        {/* 训练计划列表 */}
        <motion.div variants={item}>
          <TrainingPlanList
            plans={dayPlans}
            onSeeAll={() => navigate('/trainers')}
            onAdd={() => navigate('/trainers')}
          />
        </motion.div>

        {/* 全天无记录空状态 */}
        {consumed === 0 && burned === 0 && dayHabit.waterIntake === 0 && dayHabit.exerciseMinutes === 0 && (
          <motion.div variants={item}>
            <EmptyToday />
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


