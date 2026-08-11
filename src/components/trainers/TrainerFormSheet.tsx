import ActionSheet from '../ActionSheet'
import SolarIcon from '../SolarIcon'
import { TRAINING_ICONS } from '../../types'
import type { TrainerFormValues } from '../../hooks/useTrainerPlans'

interface TrainerFormSheetProps {
  open: boolean
  onClose: () => void
  values: TrainerFormValues
  onChange: (patch: Partial<TrainerFormValues>) => void
  onSubmit: () => void
}

/**
 * 添加训练计划表单（ActionSheet）
 */
export default function TrainerFormSheet({ open, onClose, values, onChange, onSubmit }: TrainerFormSheetProps) {
  return (
    <ActionSheet open={open} onClose={onClose} title="添加训练计划">
      <div className="space-y-3">
        <input
          value={values.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="训练名称（如：上肢力量）"
          className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="flex gap-2">
          {TRAINING_ICONS.map((ic) => (
            <button
              key={ic}
              onClick={() => onChange({ icon: ic })}
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                values.icon === ic ? 'bg-primary text-white' : 'bg-bg text-ink/50'
              }`}
            >
              <SolarIcon name={ic as never} size={20} />
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            value={values.time}
            onChange={(e) => onChange({ time: e.target.value })}
            type="time"
            className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            value={values.date}
            onChange={(e) => onChange({ date: e.target.value })}
            type="date"
            className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            value={values.duration}
            onChange={(e) => onChange({ duration: e.target.value })}
            type="number"
            placeholder="时长（分钟）"
            className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            value={values.warmup}
            onChange={(e) => onChange({ warmup: e.target.value })}
            type="number"
            placeholder="热身（分钟）"
            className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            value={values.calories}
            onChange={(e) => onChange({ calories: e.target.value })}
            type="number"
            placeholder="消耗卡路里"
            className="col-span-2 w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          onClick={onSubmit}
          className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-white shadow-fab"
        >
          保存训练
        </button>
      </div>
    </ActionSheet>
  )
}
