import { motion } from 'framer-motion'
import SolarIcon from '../SolarIcon'

/**
 * "今天做什么" 入口横幅（点击进入食材选菜）
 */
export default function RecipeBanner({ onClick }: { onClick?: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="mt-4 flex w-full items-center gap-4 rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-5 text-left text-white shadow-fab active:scale-[0.98]"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl">
        🍳
      </span>
      <div className="flex-1">
        <p className="font-display text-lg font-extrabold">今天做什么？</p>
        <p className="mt-0.5 text-xs text-white/70">选一下你有的食材，AI 推荐菜谱</p>
      </div>
      <SolarIcon name="arrow-right" size={20} className="text-white/70" />
    </motion.button>
  )
}
