import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import SolarIcon from '../components/SolarIcon'
import NutritionGrid from '../components/NutritionGrid'
import { analyzeFoodImage, compressImage, type AnalyzeResult } from '../services/deepseek'

type Stage = 'capture' | 'thinking' | 'result'

export default function AiRecognizePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const fileRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>('capture')
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeResult | null>(null)

  useEffect(() => {
    // 若从相册进入，打开文件选择
    if (params.get('source') === 'gallery') {
      fileRef.current?.click()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setImage(preview)
    setStage('thinking')
    try {
      const base64 = await compressImage(file)
      const res = await analyzeFoodImage(base64)
      setResult(res)
      setStage('result')
    } catch {
      setStage('capture')
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#1E1E2E]">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {/* 图片区域 */}
      <div className="relative flex-1 overflow-hidden">
        {image ? (
          <img src={image} alt="食物" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#2a2c4a] to-[#1E1E2E]">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-white/25 px-10 py-10 text-white"
            >
              <SolarIcon name="camera" size={40} />
              <span className="text-sm font-semibold">点击拍摄食物照片</span>
            </button>
          </div>
        )}

        {/* 虚线选择框 */}
        {image && stage === 'capture' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-64 w-64 rounded-2xl border-2 border-dashed border-white/70" />
          </div>
        )}

        {/* 思考中动画 */}
        <AnimatePresence>
          {stage === 'thinking' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#1E1E2E]/80 backdrop-blur-sm"
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
              <p className="mt-1 text-xs text-white/50">正在识别食物与营养成分</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部控制区 */}
      <div className="relative z-10 rounded-t-[2rem] bg-surface px-6 pb-8 pt-4">
        {stage === 'result' && result ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-soft to-bg text-3xl">
                {result.emoji}
              </div>
              <div className="flex-1">
                <p className="font-display text-lg font-extrabold text-ink">{result.name}</p>
                <p className="text-xs text-ink/45">{result.amount}</p>
              </div>
              <p className="font-display text-2xl font-black text-primary">{result.calories}</p>
              <span className="text-xs text-ink/40">kcal</span>
            </div>
            <NutritionGrid nutrition={result.nutrition} />
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink/50"
              >
                <SolarIcon name="close" size={22} />
              </button>
              <button
                onClick={() => navigate('/diary')}
                className="flex h-14 items-center justify-center rounded-full bg-ink px-10 text-white"
              >
                <SolarIcon name="check" size={22} />
              </button>
              <button
                onClick={() => navigate('/manual-add')}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink/50"
              >
                <SolarIcon name="edit" size={20} />
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center gap-4 py-2">
            <button
              onClick={() => navigate(-1)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink/50"
            >
              <SolarIcon name="close" size={22} />
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-14 w-24 items-center justify-center rounded-full bg-primary text-white shadow-fab"
            >
              <SolarIcon name="camera" size={24} />
            </button>
            <button
              onClick={() => navigate('/diary')}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white"
            >
              <SolarIcon name="gallery" size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
