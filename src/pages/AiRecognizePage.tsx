import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import SolarIcon from '../components/SolarIcon'
import NutritionGrid, { type NutritionKey } from '../components/NutritionGrid'
import { analyzeFoodImage, type AnalyzeResult } from '../services/deepseek'
import type { Nutrition } from '../types'

type Stage = 'thinking' | 'result'

// 判断是否微信内置浏览器（X5/WKWebView 内核）
function isWeChat(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent)
}

export default function AiRecognizePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>('thinking')
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [editedKeys, setEditedKeys] = useState<NutritionKey[]>([])
  const [caloriesEdited, setCaloriesEdited] = useState(false)
  const [editingCalories, setEditingCalories] = useState(false)
  const [calDraft, setCalDraft] = useState('')
  const [wechat] = useState(isWeChat)

  // 从 App 层传递来的图片（location.state.imageData）
  const imageData = (location.state as { imageData?: string } | null)?.imageData

  useEffect(() => {
    if (!imageData) return
    setImage(imageData ? `data:image/jpeg;base64,${imageData}` : null)
    setStage('thinking')
    setEditedKeys([])
    setCaloriesEdited(false)
    let cancelled = false
    ;(async () => {
      try {
        const res = await analyzeFoodImage(imageData)
        if (cancelled) return
        setResult(res)
        setStage('result')
      } catch {
        if (!cancelled) navigate(-1)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageData])

  // 兜底：无 state 时（如直接访问 /recognize），提供拍照/相册入口
  const handleLocalPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setImage(preview)
    setStage('thinking')
    setEditedKeys([])
    setCaloriesEdited(false)
    try {
      const { compressImage } = await import('../services/deepseek')
      const base64 = await compressImage(file)
      const res = await analyzeFoodImage(base64)
      setResult(res)
      setStage('result')
    } catch {
      setStage('thinking')
    }
  }

  const editCalories = () => {
    if (!result) return
    setEditingCalories(true)
    setCalDraft(String(result.calories))
  }

  const commitCalories = () => {
    setEditingCalories(false)
    if (!result) return
    const v = Number(calDraft)
    if (!Number.isNaN(v)) {
      setResult({ ...result, calories: Math.max(0, Math.round(v)) })
      setCaloriesEdited(true)
    }
  }

  const editNutrition = (key: NutritionKey, value: number) => {
    if (!result) return
    const nutrition: Nutrition = { ...result.nutrition, [key]: value }
    setResult({ ...result, nutrition })
    setEditedKeys((p) => (p.includes(key) ? p : [...p, key]))
  }

  return (
    <div className="flex h-full flex-col bg-[#1E1E2E]">
      {/* 兜底拍照/相册 input（无 state 直接访问时使用） */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleLocalPick}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLocalPick}
      />

      {/* 图片区域 */}
      <div className="relative flex-1 overflow-hidden">
        {image ? (
          <img src={image} alt="食物" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-5 bg-gradient-to-br from-[#2a2c4a] to-[#1E1E2E]">
            <p className="px-8 text-center text-sm text-white/60">
              请选择食物照片开始识别
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-fab"
              >
                <SolarIcon name="camera" size={20} />
                {wechat ? '拍照' : '拍摄'}
              </button>
              <button
                onClick={() => galleryRef.current?.click()}
                className="flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white"
              >
                <SolarIcon name="gallery" size={20} />
                相册
              </button>
            </div>
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
              <button
                onClick={editCalories}
                className={`flex flex-col items-center rounded-2xl px-3 py-1.5 transition active:scale-95 ${
                  caloriesEdited ? 'bg-primary-soft ring-2 ring-primary/30' : ''
                }`}
              >
                {editingCalories ? (
                  <input
                    type="number"
                    inputMode="numeric"
                    autoFocus
                    value={calDraft}
                    onChange={(e) => setCalDraft(e.target.value)}
                    onBlur={commitCalories}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitCalories()
                      if (e.key === 'Escape') setEditingCalories(false)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 rounded-lg bg-white px-1 py-0.5 text-center font-display text-2xl font-black text-primary outline-none ring-1 ring-primary/40"
                  />
                ) : (
                  <span
                    className={`font-display text-2xl font-black leading-none ${
                      caloriesEdited ? 'text-primary' : 'text-primary'
                    }`}
                  >
                    {result.calories}
                  </span>
                )}
                <span className="mt-0.5 flex items-center gap-1 text-[10px] text-ink/40">
                  kcal
                  <SolarIcon name="edit" size={10} />
                </span>
              </button>
            </div>

            {/* 低置信度提示 */}
            {result.confidence === 'low' && (
              <div className="mb-3 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
                <SolarIcon name="bolt" size={14} className="shrink-0 text-amber-500" />
                识别可能不准确，建议手动调整数值
              </div>
            )}

            <NutritionGrid
              nutrition={result.nutrition}
              onChange={editNutrition}
              editedKeys={editedKeys}
            />
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
            {/* 微信环境：拍照 + 相册 两个入口 */}
            {wechat ? (
              <>
                <button
                  onClick={() => cameraRef.current?.click()}
                  className="flex h-14 w-24 items-center justify-center gap-1 rounded-full bg-primary text-white shadow-fab"
                >
                  <SolarIcon name="camera" size={22} />
                  <span className="text-xs font-bold">拍照</span>
                </button>
                <button
                  onClick={() => galleryRef.current?.click()}
                  className="flex h-14 w-24 items-center justify-center gap-1 rounded-full bg-ink text-white"
                >
                  <SolarIcon name="gallery" size={22} />
                  <span className="text-xs font-bold">相册</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => cameraRef.current?.click()}
                  className="flex h-14 w-24 items-center justify-center rounded-full bg-primary text-white shadow-fab"
                >
                  <SolarIcon name="camera" size={24} />
                </button>
                <button
                  onClick={() => galleryRef.current?.click()}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white"
                >
                  <SolarIcon name="gallery" size={20} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
