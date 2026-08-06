import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SolarIcon from './SolarIcon'
import { todayStr } from '../types'

export default function CalendarModal({
  open,
  selected,
  datesWithData,
  onSelect,
  onClose,
}: {
  open: boolean
  selected: string
  datesWithData: string[]
  onSelect: (date: string) => void
  onClose: () => void
}) {
  const [view, setView] = useState(() => {
    const d = new Date(selected + 'T00:00:00')
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1)
    const startDay = (first.getDay() + 6) % 7 // Monday first
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
    const arr: (string | null)[] = []
    for (let i = 0; i < startDay; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(`${view.year}-${String(view.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    }
    return arr
  }, [view])

  const shift = (delta: number) => {
    setView((v) => {
      const m = v.month + delta
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 }
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-50 bg-black/40"
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 z-50 flex justify-center"
          >
            <div className="w-full max-w-[430px] rounded-t-[2rem] bg-surface px-6 pb-8 pt-3 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink/10" />
              <div className="mb-4 flex items-center justify-between">
                <button onClick={() => shift(-1)} className="rounded-full p-2 active:scale-90">
                  <SolarIcon name="arrow-left" size={18} className="text-ink/60" />
                </button>
                <p className="font-display text-base font-bold">
                  {view.year} 年 {view.month + 1} 月
                </p>
                <button onClick={() => shift(1)} className="rounded-full p-2 active:scale-90">
                  <SolarIcon name="arrow-right" size={18} className="text-ink/60" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['一', '二', '三', '四', '五', '六', '日'].map((w) => (
                  <span key={w} className="py-1 text-xs font-semibold text-ink/40">
                    {w}
                  </span>
                ))}
                {cells.map((date, i) =>
                  date ? (
                    <button
                      key={i}
                      onClick={() => {
                        onSelect(date)
                        onClose()
                      }}
                      className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition active:scale-90 ${
                        date === selected
                          ? 'bg-primary text-white'
                          : date === todayStr()
                            ? 'text-primary'
                            : 'text-ink'
                      }`}
                    >
                      {Number(date.slice(8))}
                      {datesWithData.includes(date) && date !== selected && (
                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent-gold" />
                      )}
                    </button>
                  ) : (
                    <span key={i} />
                  ),
                )}
              </div>
              <button
                onClick={onClose}
                className="mt-4 w-full rounded-full bg-ink/5 py-3 text-sm font-semibold text-ink/60"
              >
                完成
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
