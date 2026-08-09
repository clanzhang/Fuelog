import { AnimatePresence, motion } from 'framer-motion'
import SolarIcon from './SolarIcon'
import type { FoodAnalysisResult } from '../utils/ai'

/**
 * AI 识别页图片展示区
 * - 有图：原图圆形裁剪 + （识别成功时）名称/卡路里标签
 * - 无图：拍照/相册入口
 * - analyzing：思考中遮罩
 */
export default function RecognizeImageArea({
  originalImage,
  status,
  result,
  wechat,
  onCamera,
  onGallery,
}: {
  originalImage: string
  status: 'compressing' | 'analyzing' | 'success' | 'error'
  result: FoodAnalysisResult | null
  wechat: boolean
  onCamera: () => void
  onGallery: () => void
}) {
  return (
    <div className="relative flex-1 overflow-hidden px-4">
      {originalImage ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
          {/* 原图 + 圆形裁剪 */}
          <div className="flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 shadow-2xl">
            <img
              src={originalImage}
              alt="食物"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
          {status === 'success' && result && (
            <p className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
              {result.name} · {result.calories} kcal
            </p>
          )}
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-5">
          <p className="px-8 text-center text-sm text-white/60">请选择食物照片开始识别</p>
          <div className="flex gap-3">
            <button
              onClick={onCamera}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-fab"
            >
              <SolarIcon name="camera" size={20} />
              {wechat ? '拍照' : '拍摄'}
            </button>
            <button
              onClick={onGallery}
              className="flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white"
            >
              <SolarIcon name="gallery" size={20} />
              相册
            </button>
          </div>
        </div>
      )}

      {/* analyzing 遮罩：思考中 */}
      <AnimatePresence>
        {status === 'analyzing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-[#1E1E2E]/70 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-5xl"
            >
              ✨
            </motion.div>
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="mt-4 font-display text-lg font-bold text-white"
            >
              ✨ 思考中...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
