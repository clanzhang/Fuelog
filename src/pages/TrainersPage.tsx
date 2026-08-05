import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import Page from '../components/Page'
import SolarIcon from '../components/SolarIcon'
import { TRAINING_PLANS, WORKOUT_WEEK } from '../data/mock'

export default function TrainersPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const totalBurned = WORKOUT_WEEK.reduce((s, d) => s + d.burned, 0)

  return (
    <Page>
      <h1 className="font-display text-2xl font-black text-ink">训练计划</h1>
      <p className="mt-0.5 text-sm font-medium text-ink/45">
        本周累计消耗 <span className="font-bold text-accent-orange">{totalBurned} kcal</span>
      </p>

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
          <BarChart data={WORKOUT_WEEK} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
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
              {WORKOUT_WEEK.map((d) => (
                <Cell key={d.day} fill={d.isToday ? '#3942DE' : '#D6D9F2'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 训练列表 */}
      <div className="mt-5 space-y-3">
        {TRAINING_PLANS.map((p, i) => {
          const isOpen = expanded === p.id
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`overflow-hidden rounded-2xl shadow-card ${i % 2 === 0 ? 'bg-primary-soft' : 'bg-[#F8F8FC]'}`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : p.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
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
                    {p.duration} min · 热身 {p.warmup} min · {p.exercises.length} 个动作
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-extrabold text-accent-orange">🔥 {p.calories}</p>
                  <p className="text-[10px] text-ink/40">kcal</p>
                </div>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                  <SolarIcon name="arrow-left" size={16} className="rotate-[-90deg] text-ink/40" />
                </motion.span>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 px-4 pb-4">
                      {p.exercises.map((e, j) => (
                        <div key={j} className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2.5">
                          <span className="text-xs font-semibold text-ink">
                            {j + 1}. {e.name}
                          </span>
                          <div className="flex items-center gap-3 text-[11px] text-ink/50">
                            <span className="flex items-center gap-1">
                              <SolarIcon name="repeat" size={12} /> {e.sets} 组 × {e.reps}
                            </span>
                            {e.rest > 0 && (
                              <span className="flex items-center gap-1">
                                <SolarIcon name="stopwatch" size={12} /> 休息 {e.rest}s
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </Page>
  )
}
