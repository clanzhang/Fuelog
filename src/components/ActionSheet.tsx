import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import SolarIcon from './SolarIcon'

export interface ActionSheetOption {
  key: string
  label: string
  icon?: string
  emoji?: string
  color?: string
}

export default function ActionSheet({
  open,
  title,
  options,
  onSelect,
  onClose,
  children,
}: {
  open: boolean
  title?: string
  options?: ActionSheetOption[]
  onSelect?: (key: string) => void
  onClose: () => void
  children?: ReactNode
}) {
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
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink/10" />
              {title && <p className="mb-4 text-center font-display text-base font-bold">{title}</p>}
              {options && (
                <div className="space-y-2">
                  {options.map((o) => (
                    <button
                      key={o.key}
                      onClick={() => {
                        onSelect?.(o.key)
                        onClose()
                      }}
                      className="flex w-full items-center gap-4 rounded-2xl bg-bg px-4 py-4 text-left active:scale-[0.98]"
                    >
                      {o.emoji ? (
                        <span className="text-2xl">{o.emoji}</span>
                      ) : o.icon ? (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10" style={{ color: o.color || 'var(--tw-primary, #3942DE)' }}>
                          <SolarIcon name={o.icon as never} size={20} />
                        </span>
                      ) : null}
                      <span className="text-sm font-semibold" style={{ color: o.color }}>
                        {o.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {children}
              <button
                onClick={onClose}
                className="mt-4 w-full rounded-full bg-ink/5 py-3 text-sm font-semibold text-ink/60"
              >
                取消
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
