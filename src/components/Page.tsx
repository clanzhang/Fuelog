import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

export default function Page({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    <motion.div
      key={location.pathname}
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="no-scrollbar h-full overflow-y-auto px-5 pb-36 pt-5"
    >
      {children}
    </motion.div>
  )
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-black text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm font-medium text-ink/45">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}
