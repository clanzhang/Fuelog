import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

/**
 * 数字递增动画组件
 */
export default function AnimatedNumber({
  value,
  className,
  duration = 1.2,
}: {
  value: number
  className?: string
  duration?: number
}) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: 'easeOut' })
    return controls.stop
  }, [count, value, duration])

  return <motion.span className={className}>{rounded}</motion.span>
}
