import { motion } from 'framer-motion'
import type { WeekDate } from '../../hooks/useDayDiary'

interface WeekDateStripProps {
  week: WeekDate[]
  selected: string
  onSelect: (date: string) => void
}

/**
 * 日期选择条：一周 7 天（周一为起点），支持左右滑动
 */
export default function WeekDateStrip({ week, selected, onSelect }: WeekDateStripProps) {
  return (
    <div className="no-scrollbar -mx-5 mb-5 flex gap-2 overflow-x-auto px-5">
      {week.map((d) => {
        const active = d.date === selected
        return (
          <motion.button
            key={d.date}
            onClick={() => onSelect(d.date)}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: active ? 1 : 0.92 }}
            className={`flex min-w-[52px] flex-col items-center rounded-2xl py-2.5 ${
              active ? 'bg-primary text-white shadow-fab' : 'bg-surface text-ink'
            }`}
          >
            <span className={`text-[10px] font-semibold ${active ? 'text-white/70' : 'text-ink/40'}`}>
              {d.weekday}
            </span>
            <span className="mt-0.5 font-display text-lg font-extrabold">{d.day}</span>
            {d.isToday && <span className={`mt-0.5 h-1 w-1 rounded-full ${active ? 'bg-white' : 'bg-primary'}`} />}
          </motion.button>
        )
      })}
    </div>
  )
}
