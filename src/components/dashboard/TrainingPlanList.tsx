import SolarIcon from '../SolarIcon'
import type { TrainingPlan } from '../../types'

interface TrainingPlanListProps {
  plans: TrainingPlan[]
  onSeeAll?: () => void
  onAdd?: () => void
}

/**
 * 今日训练计划列表（最多 3 条 + 空状态）
 */
export default function TrainingPlanList({ plans, onSeeAll, onAdd }: TrainingPlanListProps) {
  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-extrabold text-ink">My Training Plans</h2>
        <button onClick={onSeeAll} className="text-xs font-semibold text-primary">
          See All
        </button>
      </div>
      {plans.length > 0 ? (
        <div className="space-y-3">
          {plans.slice(0, 3).map((p, i) => (
            <button
              key={p.id}
              onClick={onSeeAll}
              className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left shadow-card ${i % 2 === 0 ? 'bg-primary-soft' : 'bg-[#F8F8FC]'}`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <SolarIcon name={p.icon as never} size={24} />
              </span>
              <div className="flex-1">
                <p className="font-display text-sm font-bold text-ink">{p.name}</p>
                <p className="mt-0.5 text-[11px] text-ink/45">
                  {p.time} · {p.duration} min · 热身 {p.warmup} min
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-sm font-extrabold text-accent-orange">🔥 {p.caloriesBurned}</p>
                <p className="text-[10px] text-ink/40">kcal</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl bg-surface py-8 shadow-card">
          <span className="text-3xl">💪</span>
          <p className="mt-2 text-sm font-semibold text-ink/60">今天没有训练安排</p>
          <button
            onClick={onAdd}
            className="mt-3 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white"
          >
            添加训练
          </button>
        </div>
      )}
    </div>
  )
}
