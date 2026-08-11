import { motion } from 'framer-motion'
import Page, { PageHeader } from '../components/Page'
import SolarIcon from '../components/SolarIcon'
import CalendarModal from '../components/CalendarModal'
import StatCard from '../components/dashboard/StatCard'
import HabitCard from '../components/dashboard/HabitCard'
import TrainingPlanList from '../components/dashboard/TrainingPlanList'
import EmptyToday from '../components/dashboard/EmptyToday'
import useDaySummary from '../hooks/useDaySummary'
import { formatSubtitle } from '../utils/date'
import { container, item } from '../utils/motion'
import { useNavigate } from 'react-router-dom'

export default function TodayPage() {
  const navigate = useNavigate()
  const {
    calendarOpen,
    setCalendarOpen,
    selected,
    setSelected,
    dayHabit,
    dayPlans,
    consumed,
    burned,
    carbs,
    protein,
    fat,
    datesWithData,
    updateDayHabit,
    settings,
  } = useDaySummary()

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
            onUpdate={updateDayHabit}
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


