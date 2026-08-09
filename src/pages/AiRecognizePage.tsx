import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import RecognizeHeader from '../components/RecognizeHeader'
import RecognizeImageArea from '../components/RecognizeImageArea'
import RecognizeControls from '../components/RecognizeControls'
import { useData, todayStr } from '../context/DataContext'
import { type MealType } from '../types'
import { compressImage } from '../utils/image'
import { analyzeFood, type FoodAnalysisResult } from '../utils/ai'

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

export default function AiRecognizePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<RecognizeStatus>('compressing')
  const [originalImage, setOriginalImage] = useState<string>('')
  const [result, setResult] = useState<FoodAnalysisResult | null>(null)
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

  // 核心处理：压缩 → AI 分析（展示原图）
  useEffect(() => {
    if (!imageData) {
      setStatus('error')
      setErrorMsg('未获取到图片')
      return
    }
    let cancelled = false
    setOriginalImage(`data:image/jpeg;base64,${imageData}`)
    setStatus('analyzing')

    const run = async () => {
      // AI 分析
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

      // 分析成功 → 展示结果（原图 + 圆形裁剪）
      setResult(analysisResult)
      setStatus('success')
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
      // AI 分析
      let analysisResult: FoodAnalysisResult | null = null
      try {
        analysisResult = await analyzeFood(dataUrl)
      } catch (err) {
        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : '识别失败，请重试')
        return
      }
      setResult(analysisResult)
      setStatus('success')
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

  const saveEntry = async () => {
    if (!result || saving) return
    setSaving(true)
    addFood({
      name: result.name || '未命名食物',
      emoji: result.emoji,
      imageUrl: originalImage,
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
      <RecognizeHeader onBack={() => navigate('/diary')} />

      {/* 图片区域 */}
      <RecognizeImageArea
        originalImage={originalImage}
        status={status}
        result={result}
        wechat={wechat}
        onCamera={() => cameraRef.current?.click()}
        onGallery={() => galleryRef.current?.click()}
      />

      {/* 底部控制区 */}
      <RecognizeControls
        status={status}
        result={result}
        errorMsg={errorMsg}
        editedKeys={editedKeys}
        mealType={mealType}
        date={date}
        saving={saving}
        onFieldChange={setField}
        onEditCalories={editCalories}
        onEditNutrition={editNutrition}
        onMealTypeChange={setMealType}
        onDateChange={setDate}
        onCancel={() => navigate('/diary')}
        onSave={saveEntry}
        onManual={() => navigate('/manual-add', { state: { imageUrl: originalImage } })}
        onRetry={() => cameraRef.current?.click()}
      />
    </div>
  )
}
