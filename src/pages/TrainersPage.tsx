import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import Page from '../components/Page'
import SolarIcon from '../components/SolarIcon'
import { useData, todayStr } from '../context/DataContext'
import { TRAINING_ICONS } from '../types'
import ActionSheet from '../components/ActionSheet'

const WEEK_LABEL = ['一', '二', '三', '四', '五', '六', '日']

export default function TrainersPage() {
  const { plans, addPlan, deletePlan, updatePlan } = useData()
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('dumbbell')
  const [time, setTime] = useState('10:00')
  const [duration, setDuration] = useState('30')
  const [warmup, setWarmup] = useState('5')
  const [calories, setCalories] = useState('200')
  const [date, setDate] = useState(todayStr())

  // 本周柱状图：从训练计划按日期聚合
  const weekChart = useMemo(() => {
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

  return (
    <Page>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-ink">训练计划</h1>
          <p className="mt-0.5 text-sm font-medium text-ink/45">
            本周累计消耗 <span className="font-bold text-accent-orange">{totalBurned} kcal</span>
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-fab active:scale-90"
        >
          <SolarIcon name="add" size={22} />
        </button>
      </div>

      {/* 本周柱状图 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-3xl bg-surface p-4 shadow-card"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-sm font-bold text-ink">本周运动消耗</span>
          <span className="flex items-center gap-1 text-[11px] text-ink/45">
            <SolarIcon name="fire" size={13} className="text-accent-orange" /> kcal
          </span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weekChart} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B6B80', fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#B4B4C6' }}
              width={40}
            />
            <Tooltip
              cursor={{ fill: 'rgba(57,66,222,0.06)' }}
              contentStyle={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 4px 20px rgba(57,66,222,0.15)',
                fontSize: 12,
                fontWeight: 600,
              }}
              formatter={(v) => [`${v} kcal`, '消耗']}
            />
            <Bar dataKey="burned" radius={[8, 8, 8, 8]} barSize={22}>
              {weekChart.map((d) => (
                <Cell key={d.day} fill={d.isToday ? '#3942DE' : '#D6D9F2'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 训练列表 */}
      <div className="mt-5 space-y-3">
        {plans.length > 0 ? (
          plans.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 rounded-2xl p-4 shadow-card ${i % 2 === 0 ? 'bg-primary-soft' : 'bg-[#F8F8FC]'}`}
            >
              <button
                onClick={() => updatePlan(p.id, { completed: !p.completed })}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  p.completed ? 'border-primary bg-primary text-white' : 'border-ink/20'
                }`}
              >
                {p.completed && <SolarIcon name="check" size={12} />}
              </button>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <SolarIcon name={p.icon as never} size={24} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-display text-sm font-bold ${p.completed ? 'text-ink/40 line-through' : 'text-ink'}`}>
                  {p.name}
                </p>
                <p className="mt-0.5 text-[11px] text-ink/45">
                  {p.date} · {p.time} · {p.duration} min · 热身 {p.warmup} min
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-sm font-extrabold text-accent-orange">🔥 {p.caloriesBurned}</p>
                <p className="text-[10px] text-ink/40">kcal</p>
              </div>
              <button
                onClick={() => deletePlan(p.id)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500 active:scale-90"
              >
                <SolarIcon name="trash" size={14} />
              </button>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center rounded-2xl bg-surface py-12 shadow-card">
            <span className="text-4xl">💪</span>
            <p className="mt-2 text-sm font-semibold text-ink/60">还没有训练计划</p>
            <button
              onClick={() => setFormOpen(true)}
              className="mt-3 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white"
            >
              创建第一个计划
            </button>
          </div>
        )}
      </div>

      {/* 添加训练表单 */}
      <ActionSheet open={formOpen} onClose={() => setFormOpen(false)} title="添加训练计划">
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="训练名称（如：上肢力量）"
            className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex gap-2">
            {TRAINING_ICONS.map((ic) => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  icon === ic ? 'bg-primary text-white' : 'bg-bg text-ink/50'
                }`}
              >
                <SolarIcon name={ic as never} size={20} />
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              type="time"
              className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              type="number"
              placeholder="时长（分钟）"
              className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              value={warmup}
              onChange={(e) => setWarmup(e.target.value)}
              type="number"
              placeholder="热身（分钟）"
              className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              type="number"
              placeholder="消耗卡路里"
              className="col-span-2 w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <button
            onClick={submitPlan}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-white shadow-fab"
          >
            保存训练
          </button>
        </div>
      </ActionSheet>
    </Page>
  )
}

