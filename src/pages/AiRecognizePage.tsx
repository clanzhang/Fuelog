import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import SolarIcon from '../components/SolarIcon'
import { useData, todayStr } from '../context/DataContext'
import { MEAL_LABEL, type MealType } from '../types'
import { compressImage } from '../utils/image'
import { analyzeFood, type FoodAnalysisResult } from '../utils/ai'
import { removeFoodBackground } from '../utils/cutout'

type RecognizeStatus = 'compressing' | 'analyzing' | 'success' | 'error'

// 判断是否微信内置浏览器（X5/WKWebView 内核）
function isWeChat(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent)
}

// 根据当前时间自动预选餐类
function guessMealType(): MealType {
  const h = new Date().getHours()
  if (h >= 6 && h < 11) return 'breakfast'
  if (h >= 11 && h < 15) return 'lunch'
  if (h >= 15 && h < 18) return 'snack'
  if (h >= 18 && h < 23) return 'dinner'
  return 'breakfast'
}

const nutritionCells: { key: keyof Pick<FoodAnalysisResult, 'carbs' | 'protein' | 'fat' | 'fiber' | 'sugar' | 'sodium'>; label: string; unit: string }[] = [
  { key: 'carbs', label: '碳水', unit: 'g' },
  { key: 'protein', label: '蛋白质', unit: 'g' },
  { key: 'fat', label: '脂肪', unit: 'g' },
  { key: 'fiber', label: '纤维', unit: 'g' },
  { key: 'sugar', label: '糖', unit: 'g' },
  { key: 'sodium', label: '盐', unit: 'mg' },
]

export default function AiRecognizePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<RecognizeStatus>('compressing')
  const [originalImage, setOriginalImage] = useState<string>('')
  const [cutoutImage, setCutoutImage] = useState<string>('')
  const [result, setResult] = useState<FoodAnalysisResult | null>(null)
  const [cutoutProgress, setCutoutProgress] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [mealType, setMealType] = useState<MealType>(guessMealType)
  const [date, setDate] = useState(todayStr())
  const [saving, setSaving] = useState(false)
  const [editedKeys, setEditedKeys] = useState<string[]>([])
  const [wechat] = useState(isWeChat)
  const { addFood } = useData()

  // 从 App 层传递来的图片（location.state.imageData，可能是完整 dataURL 或纯 base64）
  const rawImageData = (location.state as { imageData?: string } | null)?.imageData
  // 统一提取纯 base64（去掉 data:...;base64, 前缀）
  const imageData = rawImageData
    ? rawImageData.replace(/^data:image\/[^;]+;base64,/, '')
    : undefined

  // 核心处理：压缩 → 分析 + 抠图（分析完成立即展示，抠图后台继续）
  useEffect(() => {
    if (!imageData) {
      setStatus('error')
      setErrorMsg('未获取到图片')
      return
    }
    let cancelled = false
    setOriginalImage(`data:image/jpeg;base64,${imageData}`)
    setStatus('analyzing')
    setCutoutProgress(null)

    const run = async () => {
      // 1. AI 分析（先完成先展示）
      let analysisResult: FoodAnalysisResult | null = null
      try {
        analysisResult = await analyzeFood(imageData)
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : '识别失败，请重试')
        return
      }
      if (cancelled) return

      // 分析成功 → 立即展示结果（先用原图，抠图后替换）
      setResult(analysisResult)
      setCutoutImage(`data:image/jpeg;base64,${imageData}`)
      setStatus('success')

      // 2. 抠图后台继续，完成后替换（失败/超时则保持原图）
      removeFoodBackground(`data:image/jpeg;base64,${imageData}`, (p) => {
        if (!cancelled) setCutoutProgress(p)
      })
        .then((cutout) => {
          if (!cancelled && cutout) setCutoutImage(cutout)
        })
        .catch(() => {
          /* 抠图失败，保持原图 */
        })
    }
    run()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageData])

  // 兜底：无 state 时（如直接访问 /recognize），提供拍照/相册入口
  const handleLocalPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('compressing')
    try {
      const base64 = await compressImage(file)
      if (!base64) throw new Error('图片压缩失败')
      // 把 base64 存到本地 state 并触发处理
      const dataUrl = base64.startsWith('data:') ? base64.split(',')[1] : base64
      // 直接本地处理
      setOriginalImage(`data:image/jpeg;base64,${dataUrl}`)
      setStatus('analyzing')
      setCutoutProgress(null)
      // 1. AI 分析（先完成先展示）
      let analysisResult: FoodAnalysisResult | null = null
      try {
        analysisResult = await analyzeFood(dataUrl)
      } catch (err) {
        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : '识别失败，请重试')
        return
      }
      setResult(analysisResult)
      setCutoutImage(`data:image/jpeg;base64,${dataUrl}`)
      setStatus('success')
      // 2. 抠图后台继续，完成后替换
      removeFoodBackground(`data:image/jpeg;base64,${dataUrl}`, (p) => setCutoutProgress(p))
        .then((cutout) => {
          if (cutout) setCutoutImage(cutout)
        })
        .catch(() => {
          /* 抠图失败，保持原图 */
        })
    } catch {
      setStatus('error')
      setErrorMsg('图片处理失败，请重试')
    }
  }

  const setField = (patch: Partial<FoodAnalysisResult>) => {
    setResult((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  const editCalories = () => {
    if (!result) return
    const v = Number(prompt('修改卡路里（kcal）', String(result.calories)))
    if (!Number.isNaN(v)) {
      setField({ calories: Math.max(0, Math.round(v)) })
      setEditedKeys((p) => (p.includes('calories') ? p : [...p, 'calories']))
    }
  }

  const editNutrition = (key: keyof Pick<FoodAnalysisResult, 'carbs' | 'protein' | 'fat' | 'fiber' | 'sugar' | 'sodium'>, label: string) => {
    if (!result) return
    const v = Number(prompt(`修改${label}`, String(result[key])))
    if (!Number.isNaN(v)) {
      setField({ [key]: Math.max(0, v) } as Partial<FoodAnalysisResult>)
      setEditedKeys((p) => (p.includes(key) ? p : [...p, key]))
    }
  }

  const saveEntry = () => {
    if (!result || saving) return
    setSaving(true)
    addFood({
      name: result.name || '未命名食物',
      emoji: result.emoji,
      imageUrl: originalImage,
      cutoutImage,
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

      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => navigate('/diary')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
        >
          <SolarIcon name="arrow-left" size={20} />
        </button>
        <span className="font-display text-sm font-bold text-white">AI 识别</span>
        <div className="h-10 w-10" />
      </div>

      {/* 图片区域 */}
      <div className="relative flex-1 overflow-hidden px-4">
        {originalImage ? (
          <div className="relative h-full w-full overflow-hidden rounded-3xl">
            {/* 背景：模糊原图（毛玻璃） */}
            <img
              src={originalImage}
              alt=""
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl opacity-40"
              draggable={false}
            />
            <div className="absolute inset-0 bg-black/30" />
            {/* 前景：抠图后的食物 */}
            {status === 'success' && cutoutImage ? (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <img src={cutoutImage} alt="食物" className="max-h-[70%] max-w-[80%] object-contain drop-shadow-2xl" />
              </div>
            ) : originalImage ? (
              <img src={originalImage} alt="食物" className="h-full w-full object-contain" />
            ) : null}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-5">
            <p className="px-8 text-center text-sm text-white/60">请选择食物照片开始识别</p>
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

        {/* analyzing 遮罩：思考中 + 抠图进度 */}
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
              {cutoutProgress !== null && cutoutProgress < 100 && (
                <div className="mt-4 w-48">
                  <p className="mb-1 text-center text-[10px] text-white/60">模型加载中... {cutoutProgress}%</p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-white transition-all" style={{ width: `${cutoutProgress}%` }} />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部控制区 */}
      <div className="no-scrollbar relative z-10 max-h-[52%] overflow-y-auto rounded-t-[2rem] bg-surface px-6 pb-8 pt-4">
        {status === 'success' && result ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* 名称 */}
            <input
              value={result.name}
              onChange={(e) => setField({ name: e.target.value })}
              placeholder="食物名称"
              className="w-full bg-transparent text-center font-display text-2xl font-black text-ink outline-none"
            />
            {/* 卡路里 */}
            <button
              onClick={editCalories}
              className="mx-auto mt-1 flex items-center gap-2 rounded-full px-4 py-1 transition active:scale-95"
            >
              <span className={`font-display text-xl font-extrabold ${editedKeys.includes('calories') ? 'text-primary' : 'text-ink'}`}>
                {result.calories} kcal
              </span>
              <SolarIcon name="edit" size={14} className="text-ink/40" />
            </button>

            {/* 黄色横幅 */}
            <div className="mt-3 flex items-center justify-center gap-1 rounded-full bg-amber-400/20 py-2">
              <span className="text-sm">🥗</span>
              <span className="text-xs font-bold text-amber-700">拍照识别卡路里 · 记录饮食</span>
            </div>

            {/* 低置信度提示 */}
            {result.confidence === 'low' && (
              <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
                <SolarIcon name="bolt" size={14} className="shrink-0 text-amber-500" />
                识别可能不准确，建议手动调整
              </div>
            )}

            {/* 六宫格营养素 */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {nutritionCells.map((cell) => {
                const edited = editedKeys.includes(cell.key)
                return (
                  <button
                    key={cell.key}
                    onClick={() => editNutrition(cell.key, cell.label)}
                    className={`flex flex-col items-center rounded-2xl py-3 transition active:scale-95 ${edited ? 'bg-primary-soft ring-2 ring-primary/30' : 'bg-bg'}`}
                  >
                    <span className="text-xs font-medium text-ink/45">{cell.label}</span>
                    <span className={`mt-0.5 font-display text-lg font-extrabold ${edited ? 'text-primary' : 'text-ink'}`}>
                      {result[cell.key]}
                    </span>
                    <span className="text-[10px] text-ink/40">{cell.unit}</span>
                  </button>
                )
              })}
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
                onClick={() => navigate('/diary')}
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
        ) : status === 'error' ? (
          /* 识别失败态 */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-6">
            <span className="text-4xl">😕</span>
            <p className="mt-3 font-display text-base font-bold text-ink">{errorMsg || '识别失败，请重试'}</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => cameraRef.current?.click()}
                className="rounded-full bg-ink/5 px-6 py-3 text-sm font-semibold text-ink"
              >
                重试
              </button>
              <button
                onClick={() => navigate('/manual-add', { state: { imageUrl: originalImage } })}
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-fab"
              >
                手动输入
              </button>
            </div>
          </motion.div>
        ) : status === 'analyzing' || status === 'compressing' ? (
          /* 处理中底部（禁用占位） */
          <div className="flex items-center justify-center gap-4 py-2 opacity-40">
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink/50">
              <SolarIcon name="close" size={22} />
            </button>
            <button className="flex h-14 items-center justify-center rounded-full bg-ink/10 px-10 text-ink/40">
              <SolarIcon name="check" size={22} />
            </button>
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink/30">
              <SolarIcon name="edit" size={20} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
