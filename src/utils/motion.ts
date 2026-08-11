// Framer Motion 页面入场动画 variants

export const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

export const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}
