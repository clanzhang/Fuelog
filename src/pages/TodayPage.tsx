import { useState } from 'react'
import { motion } from 'framer-motion'
import Page, { PageHeader } from '../components/Page'
import SolarIcon from '../components/SolarIcon'
import ProgressRing from '../components/ProgressRing'
import CalendarModal from '../components/CalendarModal'
import { CALORIE_GOAL, DAY_STATS, TODAY, TRAINING_PLANS, WATER_GOAL } from '../data/mock'
import { useNavigate } from 'react-router-dom'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatSubtitle(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDate()
  const weekday = WEEKDAYS[d.getDay()]
  const month = d.toLocaleString('en-US', { month: 'short' })
  // 以 8 月 5 日（周三）为第 17 周
  const anchor = new Date('2026-08-05T00:00:00')
  const diffDays = Math.round((anchor.getTime() - d.getTime()) / 86400000)
  const week = 17 - Math.floor(diffDays / 7)
  return `Week ${week} · ${weekday}, ${month} ${day}`
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 20 } },
}

export default function TodayPage() {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selected, setSelected] = useState(TODAY)
  const navigate = useNavigate()

  const stat = DAY_STATS.find((s) => s.date === selected) ?? DAY_STATS[DAY_STATS.length - 1]
  const calPercent = stat.consumed / CALORIE_GOAL
  const datesWithData = DAY_STATS.map((s) => s.date)

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
              <span className="font-display text-3xl font-black leading-none">{stat.consumed}</span>
              <span className="mt-1 text-[11px] text-white/70">/ {CALORIE_GOAL} kcal</span>
            </ProgressRing>
            <div className="flex-1 space-y-4">
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/70">已摄入</span>
                  <span className="font-display text-sm font-bold">{stat.consumed} kcal</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(calPercent * 100, 100)}%` }} />
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/70">运动消耗</span>
                  <span className="font-display text-sm font-bold">{stat.burned} kcal</span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <SolarIcon name="running" size={14} className="text-orange-200" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400" style={{ width: `${Math.min((stat.burned / 600) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 营养素指标 */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: '碳水', val: stat.carbs, goal: 129 },
              { label: '蛋白质', val: stat.protein, goal: 125 },
              { label: '脂肪', val: stat.fat, goal: 55 },
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
              <SolarIcon name="water" size={18} className="text-sky-400" />
            </div>
            <div className="mt-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`flex h-8 w-6 items-end justify-center rounded-md pb-1 ${
                    i < 2 ? 'bg-sky-100 text-sky-500' : 'bg-ink/5 text-ink/30'
                  }`}
                >
                  <SolarIcon name="water" size={12} />
                </div>
              ))}
            </div>
            <p className="mt-2 font-display text-sm font-bold">
              {stat.water / 1000}L <span className="text-[11px] font-semibold text-ink/40">/ {WATER_GOAL / 1000}L Per Day</span>
            </p>
            <div className="mt-2 flex gap-1">
              {['水', '茶', '咖啡'].map((t) => (
                <span key={t} className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] text-ink/50">{t}</span>
              ))}
            </div>
          </div>
          {/* 运动 */}
          <div className="rounded-2xl bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink/50">运动</span>
              <SolarIcon name="running" size={18} className="text-accent-orange" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-orange/10">
                <SolarIcon name="running" size={18} className="text-accent-orange" />
              </div>
              <span className="font-display text-lg font-extrabold">15 min</span>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-ink/40">/ 1h Per Day</p>
            <div className="mt-2 flex gap-1">
              {['慢跑', '跑步', '骑行'].map((t) => (
                <span key={t} className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] text-ink/50">{t}</span>
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
          <div className="space-y-3">
            {TRAINING_PLANS.slice(0, 3).map((p, i) => (
              <button
                key={p.id}
                onClick={() => navigate('/trainers')}
                className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left shadow-card ${i % 2 === 0 ? 'bg-primary-soft' : 'bg-[#F8F8FC]'}`}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: p.color + '22', color: p.color }}
                >
                  <SolarIcon name={p.icon as never} size={24} />
                </span>
                <div className="flex-1">
                  <p className="font-display text-sm font-bold text-ink">{p.name}</p>
                  <p className="mt-0.5 text-[11px] text-ink/45">
                    {p.duration} min · 热身 {p.warmup} min
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-extrabold text-accent-orange">🔥 {p.calories}</p>
                  <p className="text-[10px] text-ink/40">kcal</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
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
