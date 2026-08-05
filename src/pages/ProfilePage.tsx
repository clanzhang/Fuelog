import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Page from '../components/Page'
import SolarIcon from '../components/SolarIcon'
import { useData } from '../context/DataContext'
import type { UserSettings } from '../types'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 22 } },
}

export default function ProfilePage() {
  const { foods, plans, settings, updateSettings, clearAll } = useData()
  const [confirmClear, setConfirmClear] = useState(false)

  // 实时统计
  const stats = useMemo(() => {
    // 连续打卡：连续有 FoodEntry 的天数
    const dates = [...new Set(foods.map((f) => f.date))].sort().reverse()
    let streak = 0
    const seen = new Set<string>()
    for (const d of dates) {
      if (seen.has(d)) continue
      seen.add(d)
      streak++
    }
    const totalMeals = foods.length
    const totalBurn = plans.reduce((s, p) => s + p.caloriesBurned, 0)
    return [
      { label: '连续打卡', value: String(streak), unit: '天', icon: 'flame' },
      { label: '总记录餐数', value: String(totalMeals), unit: '餐', icon: 'notebook' },
      { label: '总消耗', value: totalBurn > 999 ? `${(totalBurn / 1000).toFixed(1)}k` : String(totalBurn), unit: 'kcal', icon: 'fire' },
    ]
  }, [foods, plans])

  const editSetting = (key: keyof UserSettings, label: string, suffix = '') => {
    const raw = prompt(`修改${label}，当前值：${settings[key]}${suffix}`, String(settings[key]))
    if (raw === null) return
    const v = Number(raw)
    if (!Number.isNaN(v)) updateSettings({ [key]: v })
  }

  const settingsList = [
    { label: '卡路里目标', value: `${settings.dailyCalorieGoal} kcal/天`, icon: 'target', key: 'dailyCalorieGoal' as const },
    { label: '碳水目标', value: `${settings.carbsGoal} g/天`, icon: 'leaf', key: 'carbsGoal' as const },
    { label: '蛋白质目标', value: `${settings.proteinGoal} g/天`, icon: 'battery', key: 'proteinGoal' as const },
    { label: '脂肪目标', value: `${settings.fatGoal} g/天`, icon: 'donut', key: 'fatGoal' as const },
    { label: '饮水目标', value: `${settings.waterGoal} L/天`, icon: 'water', key: 'waterGoal' as const },
    { label: '运动目标', value: `${settings.exerciseGoal} min/天`, icon: 'running', key: 'exerciseGoal' as const },
    { label: '单位切换', value: settings.unit, icon: 'settings', key: 'unit' as const },
  ]

  return (
    <Page>
      <motion.div variants={container} initial="hidden" animate="show">
        {/* 头像区 */}
        <motion.div variants={item} className="flex flex-col items-center pt-4">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark font-display text-3xl font-black text-white shadow-fab">
              {settings.userName?.[0] || 'U'}
            </div>
          </div>
          <h1 className="mt-3 font-display text-xl font-extrabold text-ink">{settings.userName || '未命名'}</h1>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-ink/45">
            <SolarIcon name="medal" size={14} className="text-accent-gold" />
            健康每一天
          </p>
        </motion.div>

        {/* 统计 */}
        <motion.div variants={item} className="mt-6 grid grid-cols-3 gap-3">
          {stats.map((s) => (
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
            {settingsList.map((s, i) => (
              <button
                key={s.label}
                onClick={() => editSetting(s.key, s.label, s.key === 'unit' ? '' : '')}
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

        {/* 清除数据 */}
        <motion.div variants={item} className="mt-6">
          {confirmClear ? (
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 rounded-full bg-ink/5 py-3 text-sm font-semibold text-ink/60"
              >
                取消
              </button>
              <button
                onClick={() => {
                  clearAll()
                  setConfirmClear(false)
                }}
                className="flex-1 rounded-full bg-rose-500 py-3 text-sm font-semibold text-white"
              >
                确认清除
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-500"
            >
              <SolarIcon name="trash" size={16} /> 清除所有数据
            </button>
          )}
        </motion.div>

        {/* 底部 */}
        <motion.div variants={item} className="mt-8 text-center">
          <p className="text-xs text-ink/35">Fuelog v1.0.0 · 健康每一天</p>
        </motion.div>
      </motion.div>
    </Page>
  )
}

