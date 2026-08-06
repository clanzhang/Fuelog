import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { List, Dialog, Stepper, Picker, Button, Toast } from 'antd-mobile'
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

// 目标项配置
interface GoalItem {
  label: string
  key: keyof UserSettings
  unit: string
  icon: string
  step: number
}

const GOALS: GoalItem[] = [
  { label: '卡路里目标', key: 'dailyCalorieGoal', unit: 'kcal/天', icon: 'target', step: 50 },
  { label: '碳水目标', key: 'carbsGoal', unit: 'g/天', icon: 'leaf', step: 10 },
  { label: '蛋白质目标', key: 'proteinGoal', unit: 'g/天', icon: 'battery', step: 10 },
  { label: '脂肪目标', key: 'fatGoal', unit: 'g/天', icon: 'donut', step: 5 },
  { label: '饮水目标', key: 'waterGoal', unit: 'L/天', icon: 'water', step: 0.5 },
  { label: '运动目标', key: 'exerciseGoal', unit: 'min/天', icon: 'running', step: 10 },
]

export default function ProfilePage() {
  const { foods, plans, settings, updateSettings, clearAll } = useData()

  // 统计卡片数据（保持 Tailwind）
  const stats = useMemo(() => {
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

  // 编辑目标弹窗状态
  const [editGoal, setEditGoal] = useState<GoalItem | null>(null)
  const [editValue, setEditValue] = useState(0)

  // 单位切换 Picker
  const [showUnitPicker, setShowUnitPicker] = useState(false)
  const unitColumns = [
    [
      { label: 'kcal', value: 'kcal' },
      { label: 'kJ', value: 'kJ' },
    ],
  ]

  const openEditGoal = (g: GoalItem) => {
    setEditGoal(g)
    setEditValue(settings[g.key] as number)
  }

  const confirmEditGoal = () => {
    if (!editGoal) return
    updateSettings({ [editGoal.key]: Math.max(0, editValue) })
    setEditGoal(null)
    Toast.show({ content: '已保存', position: 'center', duration: 1000 })
  }

  const handleClearAll = () => {
    Dialog.confirm({
      title: '清除所有数据',
      content: '确定清除所有饮食记录、训练计划和设置吗？此操作不可恢复。',
      confirmText: '确定清除',
      cancelText: '取消',
      onConfirm: () => {
        clearAll()
        Toast.show({ content: '已清除', position: 'center', duration: 1000 })
      },
    })
  }

  return (
    <Page>
      <motion.div variants={container} initial="hidden" animate="show">
        {/* 头像区（保持 Tailwind） */}
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

        {/* 统计卡片（保持 Tailwind，不改） */}
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

        {/* 目标设置 - antd List */}
        <motion.div variants={item} className="mt-6">
          <h2 className="mb-3 px-1 font-display text-base font-extrabold text-ink">目标设置</h2>
          <div className="overflow-hidden rounded-3xl shadow-card">
            <List>
              {GOALS.map((g) => (
                <List.Item
                  key={g.key}
                  prefix={
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <SolarIcon name={g.icon as never} size={18} />
                    </span>
                  }
                  description={g.unit}
                  extra={String(settings[g.key])}
                  clickable
                  onClick={() => openEditGoal(g)}
                >
                  {g.label}
                </List.Item>
              ))}
              <List.Item
                prefix={
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <SolarIcon name="settings" size={18} />
                  </span>
                }
                extra={settings.unit}
                clickable
                onClick={() => setShowUnitPicker(true)}
              >
                单位切换
              </List.Item>
            </List>
          </div>
        </motion.div>

        {/* 清除数据 - antd Button + Dialog */}
        <motion.div variants={item} className="mt-6">
          <Button color="danger" fill="outline" block onClick={handleClearAll}>
            <span className="flex items-center justify-center gap-2 text-sm font-semibold">
              <SolarIcon name="trash" size={16} /> 清除所有数据
            </span>
          </Button>
        </motion.div>

        {/* 底部 */}
        <motion.div variants={item} className="mt-8 text-center">
          <p className="text-xs text-ink/35">Fuelog v1.0.0 · 健康每一天</p>
        </motion.div>
      </motion.div>

      {/* 编辑目标弹窗 - antd Dialog + Stepper */}
      <Dialog
        visible={editGoal !== null}
        title={editGoal ? `设置${editGoal.label}` : ''}
        content={
          <div className="flex items-center justify-center gap-3 py-4">
            <Stepper
              value={editValue}
              onChange={setEditValue}
              min={0}
              step={editGoal?.step ?? 10}
            />
            <span className="text-sm text-ink/50">{editGoal?.unit}</span>
          </div>
        }
        actions={[
          { key: 'cancel', text: '取消' },
          { key: 'save', text: '保存', bold: true },
        ]}
        onAction={(action) => {
          if (action.key === 'save') {
            confirmEditGoal()
          } else {
            setEditGoal(null)
          }
        }}
      />

      {/* 单位切换 - antd Picker */}
      <Picker
        columns={unitColumns}
        visible={showUnitPicker}
        onClose={() => setShowUnitPicker(false)}
        onConfirm={(val) => {
          const u = val[0] as 'kcal' | 'kJ'
          updateSettings({ unit: u })
          setShowUnitPicker(false)
          Toast.show({ content: '已切换', position: 'center', duration: 1000 })
        }}
      />
    </Page>
  )
}

