import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import SolarIcon from '../SolarIcon'
import type { WeekChartItem } from '../../hooks/useTrainerPlans'

interface WeeklyBurnChartProps {
  weekChart: WeekChartItem[]
}

/**
 * 本周运动消耗柱状图
 */
export default function WeeklyBurnChart({ weekChart }: WeeklyBurnChartProps) {
  return (
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
  )
}
