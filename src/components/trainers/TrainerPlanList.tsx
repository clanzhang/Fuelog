import { motion } from 'framer-motion'
import SolarIcon from '../SolarIcon'
import type { TrainingPlan } from '../../types'

interface TrainerPlanListProps {
  plans: TrainingPlan[]
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onAdd: () => void
}

/**
 * 训练计划列表（含勾选完成、删除、空状态）
 */
export default function TrainerPlanList({ plans, onToggle, onRemove, onAdd }: TrainerPlanListProps) {
  if (plans.length === 0) {
    return (
      <div className="mt-5 flex flex-col items-center rounded-2xl bg-surface py-12 shadow-card">
        <span className="text-4xl">💪</span>
        <p className="mt-2 text-sm font-semibold text-ink/60">还没有训练计划</p>
        <button
          onClick={onAdd}
          className="mt-3 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white"
        >
          创建第一个计划
        </button>
      </div>
    )
  }

  return (
    <div className="mt-5 space-y-3">
      {plans.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`flex items-center gap-3 rounded-2xl p-4 shadow-card ${i % 2 === 0 ? 'bg-primary-soft' : 'bg-[#F8F8FC]'}`}
        >
          <button
            onClick={() => onToggle(p.id)}
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
            onClick={() => onRemove(p.id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500 active:scale-90"
          >
            <SolarIcon name="trash" size={14} />
          </button>
        </motion.div>
      ))}
    </div>
  )
}
