import { motion } from 'framer-motion'
import Page from '../components/Page'
import SolarIcon from '../components/SolarIcon'
import { CALORIE_GOAL, EXERCISE_GOAL, WATER_GOAL } from '../data/mock'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 22 } },
}

const STATS = [
  { label: '连续打卡', value: '12', unit: '天', icon: 'flame' },
  { label: '总记录餐数', value: '86', unit: '餐', icon: 'notebook' },
  { label: '总消耗', value: '12.4k', unit: 'kcal', icon: 'fire' },
]

const SETTINGS = [
  { label: '卡路里目标', value: `${CALORIE_GOAL} kcal/天`, icon: 'target' },
  { label: '营养素目标', value: '碳水 129 · 蛋白 125 · 脂肪 55g', icon: 'chart' },
  { label: '饮水目标', value: `${WATER_GOAL / 1000}L/天`, icon: 'water' },
  { label: '运动目标', value: `${EXERCISE_GOAL} min/天`, icon: 'running' },
  { label: '单位切换', value: '公制 (kcal / g / mg)', icon: 'settings' },
]

export default function ProfilePage() {
  return (
    <Page>
      <motion.div variants={container} initial="hidden" animate="show">
        {/* 头像区 */}
        <motion.div variants={item} className="flex flex-col items-center pt-4">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark font-display text-3xl font-black text-white shadow-fab">
              U
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow">
              <SolarIcon name="edit" size={14} className="text-primary" />
            </span>
          </div>
          <h1 className="mt-3 font-display text-xl font-extrabold text-ink">用户小明</h1>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-ink/45">
            <SolarIcon name="medal" size={14} className="text-accent-gold" />
            白金会员 · 目标：健康减脂
          </p>
        </motion.div>

        {/* 统计 */}
        <motion.div variants={item} className="mt-6 grid grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl bg-surface p-4 text-center shadow-card">
              <SolarIcon name={s.icon as never} size={20} className="mx-auto text-primary" />
              <p className="mt-2 font-display text-xl font-black text-ink">
                {s.value}
                <span className="text-xs font-bold text-ink/40"> {s.unit}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-ink/45">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* 设置 */}
        <motion.div variants={item} className="mt-6">
          <h2 className="mb-3 px-1 font-display text-base font-extrabold text-ink">目标设置</h2>
          <div className="overflow-hidden rounded-3xl bg-surface shadow-card">
            {SETTINGS.map((s, i) => (
              <button
                key={s.label}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-bg ${
                  i !== 0 ? 'border-t border-ink/5' : ''
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <SolarIcon name={s.icon as never} size={18} />
                </span>
                <span className="flex-1 text-sm font-semibold text-ink">{s.label}</span>
                <span className="text-xs text-ink/40">{s.value}</span>
                <SolarIcon name="arrow-right" size={15} className="text-ink/25" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* 底部 */}
        <motion.div variants={item} className="mt-8 text-center">
          <p className="text-xs text-ink/35">Fuelog v1.0.0 · 健康每一天</p>
        </motion.div>
      </motion.div>
    </Page>
  )
}
