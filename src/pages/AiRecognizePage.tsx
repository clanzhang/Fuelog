import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import SolarIcon from '../components/SolarIcon'
import { analyzeFoodImage, type AnalyzeResult } from '../services/deepseek'
import { useData, todayStr } from '../context/DataContext'
import { MEAL_LABEL, type MealType } from '../types'

type Stage = 'idle' | 'loading' | 'success' | 'error'

// 判断是否微信内置浏览器（X5/WKWebView 内核）
function isWeChat(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent)
}

// AI 识别超时时间（毫秒）
const TIMEOUT_MS = 15000

export default function AiRecognizePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [date, setDate] = useState(todayStr())
  const [saving, setSaving] = useState(false)
  const [wechat] = useState(isWeChat)
  const { addFood } = useData()

  // 从 App 层传递来的图片（location.state.imageData）
  const imageData = (location.state as { imageData?: string } | null)?.imageData

  // 带超时的识别：loading → success / error
  useEffect(() => {
    if (!imageData) return
    setImage(imageData ? `data:image/jpeg;base64,${imageData}` : null)
    setStage('loading')
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const run = async () => {
      try {
        // 15 秒超时兜底，避免一直卡在 loading
        timer = setTimeout(() => {
          if (!cancelled) setStage('error')
        }, TIMEOUT_MS)
        const res = await analyzeFoodImage(imageData)
        if (cancelled) return
        clearTimeout(timer)
        setResult(res)
        setStage('success')
      } catch {
        if (cancelled) return
        clearTimeout(timer)
        setStage('error')
      }
    }
    run()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageData])

  // 兜底：无 state 时（如直接访问 /recognize），提供拍照/相册入口
  const handleLocalPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setImage(preview)
    setStage('loading')
    try {
      const { compressImage } = await import('../services/deepseek')
      const base64 = await compressImage(file)
      const res = await analyzeFoodImage(base64)
      setResult(res)
      setStage('success')
    } catch {
      setStage('error')
    }
  }

  const setField = (patch: Partial<AnalyzeResult>) => {
    setResult((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  const editCalories = () => {
    if (!result) return
    const v = Number(prompt('修改卡路里（kcal）', String(result.calories)))
    if (!Number.isNaN(v)) setField({ calories: Math.max(0, Math.round(v)) })
  }

  const editNutrition = (key: 'carbs' | 'protein' | 'fat' | 'fiber' | 'sugar' | 'sodium', label: string) => {
    if (!result) return
    const v = Number(prompt(`修改${label}`, String(result[key])))
    if (!Number.isNaN(v)) setField({ [key]: Math.max(0, v) } as Partial<AnalyzeResult>)
  }

  const saveEntry = () => {
    if (!result || saving) return
    setSaving(true)
    addFood({
      name: result.name || '未命名食物',
      emoji: result.emoji,
      imageUrl: imageData ? `data:image/jpeg;base64,${imageData}` : undefined,
      calories: result.calories,
      carbs: result.carbs,
      protein: result.protein,
      fat: result.fat,
      fiber: result.fiber,
      sugar: result.sugar,
      sodium: result.sodium,
      tips: result.tips,
      mealType,
      date,
    })
    setSaving(false)
    navigate('/diary')
  }

  const nutritionCells: { key: 'carbs' | 'protein' | 'fat' | 'fiber' | 'sugar' | 'sodium'; label: string; unit: string }[] = [
    { key: 'carbs', label: '碳水', unit: 'g' },
    { key: 'protein', label: '蛋白质', unit: 'g' },
    { key: 'fat', label: '脂肪', unit: 'g' },
    { key: 'fiber', label: '纤维', unit: 'g' },
    { key: 'sugar', label: '糖', unit: 'g' },
    { key: 'sodium', label: '盐', unit: 'mg' },
  ]

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

        {/* 思考中动画（loading） */}
        <AnimatePresence>
          {stage === 'loading' && image && (
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
      <div className="no-scrollbar relative z-10 max-h-[55%] overflow-y-auto rounded-t-[2rem] bg-surface px-6 pb-8 pt-4">
        {stage === 'success' && result ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-soft to-bg text-3xl">
                {result.emoji}
              </div>
              <div className="flex-1">
                <input
                  value={result.name}
                  onChange={(e) => setField({ name: e.target.value })}
                  placeholder="食物名称"
                  className="w-full bg-transparent font-display text-lg font-extrabold text-ink outline-none"
                />
                <p className="text-xs text-ink/45">点击名称可修改</p>
              </div>
              <button
                onClick={editCalories}
                className="flex flex-col items-center rounded-2xl px-3 py-1.5 transition active:scale-95"
              >
                <span className="font-display text-2xl font-black leading-none text-primary">
                  {result.calories}
                </span>
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

            {/* 六宫格营养素（可编辑） */}
            <div className="grid grid-cols-3 gap-2">
              {nutritionCells.map((cell) => (
                <button
                  key={cell.key}
                  onClick={() => editNutrition(cell.key, cell.label)}
                  className="flex flex-col items-center rounded-2xl bg-bg py-3 transition active:scale-95"
                >
                  <span className="text-xs font-medium text-ink/45">{cell.label}</span>
                  <span className="mt-0.5 font-display text-lg font-extrabold text-ink">
                    {result[cell.key]}
                  </span>
                  <span className="text-[10px] text-ink/40">{cell.unit}</span>
                </button>
              ))}
            </div>

            {/* 餐类选择 */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-ink/50">餐类</p>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(MEAL_LABEL) as MealType[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMealType(m)}
                    className={`rounded-full py-2 text-xs font-semibold transition ${
                      mealType === m ? 'bg-primary text-white' : 'bg-bg text-ink/50'
                    }`}
                  >
                    {MEAL_LABEL[m]}
                  </button>
                ))}
              </div>
            </div>

            {/* 日期选择 */}
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-bg px-4 py-3">
              <span className="text-xs font-semibold text-ink/50">日期</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-sm font-semibold text-ink outline-none"
              />
            </div>

            {/* 底部三按钮 */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink/50"
              >
                <SolarIcon name="close" size={22} />
              </button>
              <button
                onClick={saveEntry}
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
        ) : stage === 'error' ? (
          /* 识别失败态 */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-6">
            <span className="text-4xl">😕</span>
            <p className="mt-3 font-display text-base font-bold text-ink">识别失败，请重试或手动输入</p>
            <p className="mt-1 text-xs text-ink/45">可能是网络问题或图片不清晰</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => cameraRef.current?.click()}
                className="rounded-full bg-ink/5 px-6 py-3 text-sm font-semibold text-ink"
              >
                重新选择
              </button>
              <button
                onClick={() => navigate('/manual-add')}
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-fab"
              >
                手动输入
              </button>
            </div>
          </motion.div>
        ) : stage === 'loading' && image ? (
          /* loading 态底部（禁用按钮占位） */
          <div className="flex items-center justify-center gap-4 py-2 opacity-40">
            <button
              onClick={() => navigate(-1)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink/50"
            >
              <SolarIcon name="close" size={22} />
            </button>
            <button className="flex h-14 items-center justify-center rounded-full bg-ink/10 px-10 text-ink/40">
              <SolarIcon name="check" size={22} />
            </button>
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink/30">
              <SolarIcon name="edit" size={20} />
            </button>
          </div>
        ) : (
          /* idle 态：兜底拍照/相册入口 */
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
