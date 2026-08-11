import { motion } from 'framer-motion'
import SolarIcon from '../SolarIcon'

interface CalorieBannerProps {
  consumed: number
  calorieGoal: number
  remaining: number
}

/**
 * 总摄入横幅：当日摄入 / 目标 + 剩余热量
 */
export default function CalorieBanner({ consumed, calorieGoal, remaining }: CalorieBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 flex items-center justify-between rounded-3xl bg-surface px-6 py-5 shadow-card"
    >
      <div>
        <p className="text-xs font-semibold text-ink/45">总摄入 (kcal)</p>
        <p className="mt-1 font-display text-[28px] font-extrabold leading-none text-ink">
          {consumed}
          <span className="text-lg font-bold text-ink/30"> / {calorieGoal}</span>
        </p>
      </div>
      <div className="flex items-center gap-1 rounded-full bg-primary-soft px-3 py-2">
        <SolarIcon name="fire" size={16} className="text-accent-orange" />
        <span className="text-xs font-bold text-primary">剩 {Math.max(remaining, 0)} kcal</span>
      </div>
    </motion.div>
  )
}
