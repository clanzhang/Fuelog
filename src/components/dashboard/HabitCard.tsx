import { useState } from 'react'
import { motion } from 'framer-motion'
import SolarIcon from '../SolarIcon'
import ActionSheet from '../ActionSheet'
import { WATER_LABEL, WATER_ICON, WATER_QUICK, EXERCISE_QUICK } from '../../utils/habits'
import { EXERCISE_TYPES, WATER_TYPES, type HabitLog } from '../../types'

interface HabitCardProps {
  habit: HabitLog
  waterGoal: number
  exerciseGoal: number
  onUpdate: (patch: Partial<HabitLog>) => void
}

/**
 * 习惯追踪卡片：饮水 + 运动（含快捷添加弹窗）
 */
export default function HabitCard({ habit, waterGoal, exerciseGoal, onUpdate }: HabitCardProps) {
  const [waterSheetOpen, setWaterSheetOpen] = useState(false)
  const [exerciseSheetOpen, setExerciseSheetOpen] = useState(false)
  const [exerciseType, setExerciseType] = useState(habit.exerciseType || '慢跑')

  // 水杯填充：4 个水杯，共显示到目标量
  const waterPerCup = waterGoal / 4
  const filledCups = habit.waterIntake / waterPerCup

  const addWater = (ml: number) => {
    const liters = Math.round((habit.waterIntake * 1000 + ml) / 10) / 100
    onUpdate({ waterIntake: Math.min(10, liters) })
    setWaterSheetOpen(false)
  }

  const addExercise = (minutes: number, type: string) => {
    onUpdate({ exerciseMinutes: habit.exerciseMinutes + minutes, exerciseType: type })
    setExerciseSheetOpen(false)
  }

  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      {/* 饮水 */}
      <div className="rounded-2xl bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink/50">饮水</span>
          <button
            onClick={() => setWaterSheetOpen(true)}
            className="rounded-full bg-sky-50 p-1.5 active:scale-90"
            aria-label="添加饮水"
          >
            <SolarIcon name="water" size={18} className="text-sky-400" />
          </button>
        </div>
        {/* 水杯填充 */}
        <button
          onClick={() => setWaterSheetOpen(true)}
          className="mt-3 flex gap-1"
          aria-label="点击添加饮水"
        >
          {[0, 1, 2, 3].map((i) => {
            const filled = filledCups > i
            const partial = filledCups > i && filledCups < i + 1
            const pct = Math.max(0, Math.min(1, filledCups - i)) * 100
            return (
              <div
                key={i}
                className={`relative flex h-10 w-7 items-end justify-center overflow-hidden rounded-lg border pb-1 transition ${
                  filled || partial ? 'border-sky-200' : 'border-ink/10 bg-ink/5'
                }`}
              >
                {/* 水填充动画 */}
                <div
                  className={`absolute inset-x-0 bottom-0 transition-all duration-500 ${
                    filled || partial ? 'bg-sky-400/80' : 'bg-transparent'
                  }`}
                  style={{ height: `${filled || partial ? pct : 0}%` }}
                />
                <span className={`relative z-10 ${filled || partial ? 'text-sky-600' : 'text-ink/30'}`}>
                  <SolarIcon name={WATER_ICON[habit.waterType] as never} size={12} />
                </span>
              </div>
            )
          })}
        </button>
        <p className="mt-2 font-display text-sm font-bold">
          {habit.waterIntake}L <span className="text-[11px] font-semibold text-ink/40">/ {waterGoal}L Per Day</span>
        </p>
        {/* 饮品类型切换 */}
        <div className="mt-2 flex gap-1">
          {WATER_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => onUpdate({ waterType: t })}
              className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] ${
                habit.waterType === t ? 'bg-sky-100 text-sky-600' : 'bg-ink/5 text-ink/50'
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
          <button
            onClick={() => setExerciseSheetOpen(true)}
            className="rounded-full bg-accent-orange/10 p-1.5 active:scale-90"
            aria-label="添加运动"
          >
            <SolarIcon name="running" size={18} className="text-accent-orange" />
          </button>
        </div>
        {/* 运动时长（点击弹出选择） */}
        <button
          onClick={() => setExerciseSheetOpen(true)}
          className="mt-3 flex items-center gap-2"
          aria-label="点击记录运动时长"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-orange/10"
          >
            <SolarIcon name="running" size={18} className="text-accent-orange" />
          </motion.div>
          <span className="font-display text-lg font-extrabold">{habit.exerciseMinutes} min</span>
        </button>
        <p className="mt-1 text-[11px] font-semibold text-ink/40">/ {exerciseGoal}min Per Day</p>
        {/* 运动类型标签：2 行 3 列网格，不溢出 */}
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {EXERCISE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => {
                setExerciseType(t)
                setExerciseSheetOpen(true)
              }}
              className={`whitespace-nowrap rounded-full px-1.5 py-1 text-[10px] transition active:scale-95 ${
                habit.exerciseType === t
                  ? 'bg-accent-orange/15 font-bold text-accent-orange'
                  : 'bg-ink/5 text-ink/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 饮水快捷添加弹窗 */}
      <ActionSheet
        open={waterSheetOpen}
        onClose={() => setWaterSheetOpen(false)}
        title="添加饮水"
        options={WATER_QUICK.map((w) => ({
          key: w.key,
          label: `${w.label} · ${w.hint}`,
          icon: w.icon,
          color: '#0EA5E9',
        }))}
        onSelect={(key) => addWater(Number(key))}
      />

      {/* 运动记录弹窗 */}
      <ActionSheet
        open={exerciseSheetOpen}
        onClose={() => setExerciseSheetOpen(false)}
        title={`记录${exerciseType}时长`}
        onSelect={() => {
          /* 通过下方自定义按钮记录 */
        }}
      >
        <div className="grid grid-cols-3 gap-2">
          {EXERCISE_QUICK.map((min) => (
            <button
              key={min}
              onClick={() => addExercise(min, exerciseType)}
              className="rounded-2xl bg-accent-orange/10 py-3.5 text-sm font-bold text-accent-orange transition active:scale-95"
            >
              {min} min
            </button>
          ))}
          <button
            onClick={() => addExercise(5, exerciseType)}
            className="rounded-2xl bg-ink/5 py-3.5 text-sm font-bold text-ink/60 transition active:scale-95"
          >
            5 min
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] text-ink/40">
          累计：{habit.exerciseMinutes} min / 目标 {exerciseGoal} min
        </p>
      </ActionSheet>
    </div>
  )
}
