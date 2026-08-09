import { motion } from 'framer-motion'

/**
 * AI 识别失败态：错误信息 + 重试 / 手动输入
 */
export default function RecognizeError({
  message,
  onRetry,
  onManual,
}: {
  message: string
  onRetry: () => void
  onManual: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-6">
      <span className="text-4xl">😕</span>
      <p className="mt-3 font-display text-base font-bold text-ink">{message || '识别失败，请重试'}</p>
      <div className="mt-5 flex gap-3">
        <button
          onClick={onRetry}
          className="rounded-full bg-ink/5 px-6 py-3 text-sm font-semibold text-ink"
        >
          重试
        </button>
        <button
          onClick={onManual}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-fab"
        >
          手动输入
        </button>
      </div>
    </motion.div>
  )
}
