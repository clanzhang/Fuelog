import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function ProgressRing({
  size = 160,
  stroke = 14,
  progress,
  color = '#FFFFFF',
  track = 'rgba(255,255,255,0.2)',
  children,
}: {
  size?: number
  stroke?: number
  progress: number // 0-1
  color?: string
  track?: string
  children?: React.ReactNode
}) {
  const [shown, setShown] = useState(0)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r

  useEffect(() => {
    const t = setTimeout(() => setShown(Math.min(progress, 1)), 100)
    return () => clearTimeout(t)
  }, [progress])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - shown) }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}
