import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import SolarIcon from '../components/SolarIcon'
import NutritionGrid, { type NutritionKey } from '../components/NutritionGrid'
import { analyzeFoodImage, compressImage, type AnalyzeResult } from '../services/deepseek'
import type { Nutrition } from '../types'

type Stage = 'capture' | 'thinking' | 'result'

// 判断是否微信内置浏览器（X5/WKWebView 内核）
function isWeChat(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent)
}

export default function AiRecognizePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>('capture')
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [editedKeys, setEditedKeys] = useState<NutritionKey[]>([])
  const [caloriesEdited, setCaloriesEdited] = useState(false)
  const [editingCalories, setEditingCalories] = useState(false)
  const [calDraft, setCalDraft] = useState('')
  const [wechat] = useState(isWeChat)

  useEffect(() => {
    // 若从相册进入，打开文件选择
    if (params.get('source') === 'gallery') {
      galleryRef.current?.click()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setImage(preview)
    setStage('thinking')
    setEditedKeys([])
    setCaloriesEdited(false)
    try {
      const base64 = await compressImage(file)
      const res = await analyzeFoodImage(base64)
      setResult(res)
      setStage('result')
    } catch {
      setStage('capture')
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
      {/* 拍照入口：capture="environment" 调起系统相机（微信 X5 内核兼容） */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      {/* 相册入口：普通 file input */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
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
              onClick={() => cameraRef.current?.click()}
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
