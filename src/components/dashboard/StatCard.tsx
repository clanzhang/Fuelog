import SolarIcon from '../SolarIcon'
import ProgressRing from '../ProgressRing'
import AnimatedNumber from './AnimatedNumber'

interface StatCardProps {
  consumed: number
  burned: number
  carbs: number
  protein: number
  fat: number
  calorieGoal: number
  carbsGoal: number
  proteinGoal: number
  fatGoal: number
  onGoDiary?: () => void
  onGoTrainers?: () => void
}

/**
 * 每日统计大卡片（渐变背景）：热量圆环 + 已摄入/运动消耗 + 营养素指标
 */
export default function StatCard({
  consumed,
  burned,
  carbs,
  protein,
  fat,
  calorieGoal,
  carbsGoal,
  proteinGoal,
  fatGoal,
  onGoDiary,
  onGoTrainers,
}: StatCardProps) {
  const calPercent = consumed / calorieGoal

  return (
    <div className="rounded-[2rem] bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-card">
      <div className="flex items-center gap-5">
        <ProgressRing progress={calPercent} color="#FFFFFF" track="rgba(255,255,255,0.18)">
          <AnimatedNumber value={consumed} className="font-display text-3xl font-black leading-none" />
          <span className="mt-1 text-[11px] text-white/70">/ {calorieGoal} kcal</span>
        </ProgressRing>
        <div className="flex-1 space-y-4">
          {/* 已摄入（点击跳 Diary） */}
          <button
            onClick={onGoDiary}
            className="w-full rounded-2xl bg-white/10 p-3 text-left active:scale-[0.98] transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">已摄入</span>
              <span className="font-display text-sm font-bold">
                <AnimatedNumber value={consumed} /> kcal
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(calPercent * 100, 100)}%` }}
              />
            </div>
          </button>
          {/* 运动消耗（点击跳 Trainers） */}
          <button
            onClick={onGoTrainers}
            className="w-full rounded-2xl bg-white/10 p-3 text-left active:scale-[0.98] transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">运动消耗</span>
              <span className="font-display text-sm font-bold">
                <AnimatedNumber value={burned} /> kcal
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <SolarIcon name="running" size={14} className="text-orange-200" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400 transition-all duration-1000 ease-out" style={{ width: `${Math.min((burned / 600) * 100, 100)}%` }} />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 营养素指标 */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: '碳水', val: carbs, goal: carbsGoal },
          { label: '蛋白质', val: protein, goal: proteinGoal },
          { label: '脂肪', val: fat, goal: fatGoal },
        ].map((n) => {
          const progress = n.goal > 0 ? n.val / n.goal : 0
          const over = progress >= 1
          return (
            <div key={n.label} className="rounded-2xl bg-white/10 p-3 text-center">
              <p className="text-[11px] text-white/70">{n.label}</p>
              <p className="mt-1 font-display text-base font-extrabold">
                <AnimatedNumber value={n.val} />
                <span className="text-[10px] font-semibold text-white/60">/{n.goal}g</span>
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(progress * 100, 100)}%`,
                    backgroundColor: over ? '#FF3B30' : '#FFFFFF',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
