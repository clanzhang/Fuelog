import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useData, todayStr } from '../context/DataContext'
import type { MealType } from '../types'
import { compressImage } from '../utils/image'
import { analyzeFood, type FoodAnalysisResult } from '../utils/ai'

export type RecognizeStatus = 'compressing' | 'analyzing' | 'success' | 'error'

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

export interface UseRecognizeReturn {
  // 兜底文件 input 引用
  cameraRef: React.RefObject<HTMLInputElement>
  galleryRef: React.RefObject<HTMLInputElement>
  // 状态
  status: RecognizeStatus
  originalImage: string
  result: FoodAnalysisResult | null
  errorMsg: string
  mealType: MealType
  date: string
  saving: boolean
  editedKeys: string[]
  wechat: boolean
  // 操作
  handleLocalPick: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFieldChange: (patch: Partial<FoodAnalysisResult>) => void
  onEditCalories: () => void
  onEditNutrition: (key: keyof Pick<FoodAnalysisResult, 'carbs' | 'protein' | 'fat' | 'fiber' | 'sugar' | 'sodium'>, label: string) => void
  onMealTypeChange: (m: MealType) => void
  onDateChange: (d: string) => void
  onSave: () => void
  onCancel: () => void
  onManual: () => void
  onRetry: () => void
}

/**
 * AI 食物识别页核心业务 Hook：
 * 管理图片获取、压缩、AI 分析、结果编辑与保存的全流程状态。
 */
export default function useRecognize(): UseRecognizeReturn {
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

  // 核心处理：AI 分析（展示原图）
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
      const dataUrl = base64.startsWith('data:') ? base64.split(',')[1] : base64
      setOriginalImage(`data:image/jpeg;base64,${dataUrl}`)
      setStatus('analyzing')
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

  const onFieldChange = (patch: Partial<FoodAnalysisResult>) => {
    setResult((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  const onEditCalories = () => {
    if (!result) return
    const v = Number(prompt('修改卡路里（kcal）', String(result.calories)))
    if (!Number.isNaN(v)) {
      onFieldChange({ calories: Math.max(0, Math.round(v)) })
      setEditedKeys((p) => (p.includes('calories') ? p : [...p, 'calories']))
    }
  }

  const onEditNutrition = (
    key: keyof Pick<FoodAnalysisResult, 'carbs' | 'protein' | 'fat' | 'fiber' | 'sugar' | 'sodium'>,
    label: string,
  ) => {
    if (!result) return
    const v = Number(prompt(`修改${label}`, String(result[key])))
    if (!Number.isNaN(v)) {
      onFieldChange({ [key]: Math.max(0, v) } as Partial<FoodAnalysisResult>)
      setEditedKeys((p) => (p.includes(key) ? p : [...p, key]))
    }
  }

  const onSave = async () => {
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

  const onCancel = () => navigate('/diary')
  const onManual = () => navigate('/manual-add', { state: { imageUrl: originalImage } })
  const onRetry = () => cameraRef.current?.click()

  return {
    cameraRef,
    galleryRef,
    status,
    originalImage,
    result,
    errorMsg,
    mealType,
    date,
    saving,
    editedKeys,
    wechat,
    handleLocalPick,
    onFieldChange,
    onEditCalories,
    onEditNutrition,
    onMealTypeChange: setMealType,
    onDateChange: setDate,
    onSave,
    onCancel,
    onManual,
    onRetry,
  }
}
