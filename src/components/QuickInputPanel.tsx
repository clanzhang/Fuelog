import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SolarIcon from './SolarIcon'
import { quickLog, type QuickLogResult, type QuickFoodItem } from '../utils/quicklog'
import { MEAL_LABEL } from '../types'

// Web Speech API 类型声明
interface SpeechRecognitionEventLike {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

/**
 * 快速记录输入面板（底部滑入）
 * 由全局"+"按钮控制开关：语音（长按）或文字输入 → AI 解析 → 确认卡片 → onConfirm
 */
export default function QuickInputPanel({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (result: QuickLogResult) => void
}) {
  const [text, setText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [result, setResult] = useState<QuickLogResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [listening, setListening] = useState(false)
  const [amountEdits, setAmountEdits] = useState<Record<number, number>>({})
  const recogRef = useRef<SpeechRecognitionLike | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 打开面板时聚焦输入框
  useEffect(() => {
    if (open) {
      setResult(null)
      setErrorMsg('')
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  // 根据时间变化的 placeholder
  const placeholder = (() => {
    const h = new Date().getHours()
    if (h >= 6 && h < 11) return '早餐吃了什么？'
    if (h >= 11 && h < 15) return '午餐吃了什么？'
    if (h >= 15 && h < 18) return '加餐吃了什么？'
    if (h >= 18 && h < 23) return '晚餐吃了什么？'
    return '记录一下...'
  })()

  // 长按开始录音
  const startListening = () => {
    const SR = getSpeechRecognition()
    if (!SR) {
      setErrorMsg('当前浏览器不支持语音输入')
      return
    }
    if (!recogRef.current) {
      const recog = new SR()
      recog.lang = 'zh-CN'
      recog.continuous = false
      recog.interimResults = false
      recog.onresult = (e) => {
        const transcript = e.results[0]?.[0]?.transcript ?? ''
        if (transcript) {
          setText(transcript)
        } else {
          setErrorMsg('没听清，请重试')
        }
        setListening(false)
      }
      recog.onerror = () => setListening(false)
      recog.onend = () => setListening(false)
      recogRef.current = recog
    }
    setErrorMsg('')
    setListening(true)
    recogRef.current.start()
  }

  // 松开停止录音
  const stopListening = () => {
    if (recogRef.current && listening) {
      recogRef.current.stop()
    }
  }

  // 提交解析
  const submit = async (value?: string) => {
    const input = (value ?? text).trim()
    if (!input || parsing) return
    setParsing(true)
    setErrorMsg('')
    setResult(null)
    try {
      const r = await quickLog(input)
      setResult(r)
      setAmountEdits({})
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '解析失败，请重试')
    } finally {
      setParsing(false)
    }
  }

  // 修改数量
  const setAmount = (index: number, amount: number) => {
    setAmountEdits((prev) => ({ ...prev, [index]: Math.max(1, amount) }))
  }

  // 按修改后的数量重新计算
  const effectiveItems: QuickFoodItem[] = result
    ? result.items.map((item, i) => {
        const newAmount = amountEdits[i]
        if (!newAmount) return item
        const ratio = newAmount / item.amount
        return {
          ...item,
          amount: newAmount,
          calories: Math.round(item.calories * ratio),
          protein: Math.round(item.protein * ratio * 10) / 10,
          carbs: Math.round(item.carbs * ratio * 10) / 10,
          fat: Math.round(item.fat * ratio * 10) / 10,
        }
      })
    : []

  const effectiveTotal = {
    calories: effectiveItems.reduce((s, i) => s + i.calories, 0),
    protein: Math.round(effectiveItems.reduce((s, i) => s + i.protein, 0) * 10) / 10,
    carbs: Math.round(effectiveItems.reduce((s, i) => s + i.carbs, 0) * 10) / 10,
    fat: Math.round(effectiveItems.reduce((s, i) => s + i.fat, 0) * 10) / 10,
  }

  const confirm = () => {
    if (!result) return
    onConfirm({
      ...result,
      items: effectiveItems,
      totalCalories: effectiveTotal.calories,
      totalProtein: effectiveTotal.protein,
      totalCarbs: effectiveTotal.carbs,
      totalFat: effectiveTotal.fat,
    })
    // 重置 + 关闭面板
    setResult(null)
    setText('')
    setAmountEdits({})
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 遮罩：点击关闭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-black/40"
          />
          {/* 底部面板 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px]"
          >
            <div className="max-h-[50vh] overflow-y-auto rounded-t-3xl bg-surface p-6 pb-8 shadow-2xl">
              {/* 顶部把手 + 关闭 */}
              <div className="mb-3 flex items-center justify-between">
                <div className="mx-auto h-1.5 w-10 rounded-full bg-ink/10" />
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-bg text-ink/50"
                  aria-label="关闭输入面板"
                >
                  <SolarIcon name="close" size={18} />
                </button>
              </div>

              {/* 语音输入（长按） */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onTouchStart={(e) => {
                  e.preventDefault()
                  startListening()
                }}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  stopListening()
                }}
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onMouseLeave={stopListening}
                className={`flex h-20 w-full items-center justify-center rounded-xl transition-colors ${
                  listening ? 'border-2 border-rose-500 bg-rose-50' : 'bg-primary-soft'
                }`}
              >
                {listening ? (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="flex items-center gap-3"
                  >
                    <SolarIcon name="microphone" size={32} className="text-rose-500" />
                    <span className="text-sm font-bold text-rose-500">正在听...</span>
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-3">
                    <SolarIcon name="microphone" size={32} className="text-primary" />
                    <span className="text-sm font-bold text-primary">长按说话，松开识别</span>
                  </div>
                )}
              </motion.button>

              {/* 分隔线 */}
              <div className="my-4 flex items-center">
                <div className="flex-1 border-t border-ink/10" />
                <span className="px-4 text-xs text-ink/40">或</span>
                <div className="flex-1 border-t border-ink/10" />
              </div>

              {/* 文字输入 */}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder={placeholder}
                  className="flex-1 rounded-xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  onClick={() => submit()}
                  disabled={parsing || !text.trim()}
                  className="flex items-center justify-center rounded-xl bg-primary px-4 text-white transition active:scale-95 disabled:bg-ink/15"
                  aria-label="发送"
                >
                  {parsing ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      ✨
                    </motion.span>
                  ) : (
                    <SolarIcon name="arrow-right" size={20} />
                  )}
                </button>
              </div>

              {/* 错误提示 */}
              {errorMsg && <p className="mt-3 text-center text-xs text-rose-500">{errorMsg}</p>}

              {/* v0.0.2 提示 */}
              <p className="mt-4 text-center text-xs text-ink/35">v0.0.2 即将支持拍照识别 📷</p>

              {/* 确认卡片 */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-4 overflow-hidden rounded-2xl border border-primary/15 bg-bg/50"
                  >
                    <div className="border-b border-ink/5 px-4 py-3">
                      <p className="text-xs font-bold text-ink/50">
                        {MEAL_LABEL[result.mealType]} · 解析结果
                      </p>
                    </div>
                    <div className="space-y-3 px-4 py-3">
                      {effectiveItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-2xl">{item.emoji}</span>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-ink">
                              {item.name} × {item.amount}{item.unit}
                              {item.isEstimated && (
                                <span className="ml-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                                  AI 估算
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-ink/45">
                              蛋白 {item.protein}g · 碳水 {item.carbs}g · 脂肪 {item.fat}g
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-sm font-extrabold text-ink">{item.calories} kcal</p>
                            <button
                              onClick={() => {
                                const input = window.prompt('修改数量（克/毫升）', String(item.amount))
                                if (input) setAmount(i, Number(input))
                              }}
                              className="mt-0.5 text-[10px] font-semibold text-primary"
                            >
                              修改数量
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between bg-surface/80 px-4 py-3">
                      <div>
                        <p className="text-[11px] text-ink/45">合计</p>
                        <p className="font-display text-lg font-extrabold text-primary">
                          {effectiveTotal.calories} kcal
                        </p>
                        <p className="text-[10px] text-ink/40">
                          蛋白 {effectiveTotal.protein}g · 碳水 {effectiveTotal.carbs}g · 脂肪 {effectiveTotal.fat}g
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setResult(null)
                            setAmountEdits({})
                          }}
                          className="rounded-full bg-ink/5 px-5 py-2.5 text-xs font-semibold text-ink/60"
                        >
                          取消
                        </button>
                        <button
                          onClick={confirm}
                          className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-fab"
                        >
                          ✓ 确认记录
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
