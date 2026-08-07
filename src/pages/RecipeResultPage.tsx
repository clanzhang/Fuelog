import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import SolarIcon from '../components/SolarIcon'
import { useData } from '../context/DataContext'
import { generateRecipes, type GeneratedRecipe } from '../utils/recipes'

type ResultStatus = 'loading' | 'success' | 'error'

const DIFF_COLOR: Record<GeneratedRecipe['difficulty'], string> = {
  简单: 'bg-green-50 text-green-600',
  中等: 'bg-amber-50 text-amber-600',
  较难: 'bg-rose-50 text-rose-500',
}

export default function RecipeResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addFavorite } = useData()
  const state = location.state as { ingredients?: string[]; tool?: string; flavor?: string } | null
  const [status, setStatus] = useState<ResultStatus>('loading')
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([])
  const [favorited, setFavorited] = useState<Set<string>>(new Set())
  const [errorMsg, setErrorMsg] = useState('')

  const ingredients = state?.ingredients ?? []
  const tool = state?.tool ?? ''
  const flavor = state?.flavor ?? ''

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const list = await generateRecipes(ingredients, tool, flavor)
        if (cancelled) return
        setRecipes(list)
        setStatus('success')
      } catch (err) {
        if (cancelled) return
        setErrorMsg(err instanceof Error ? err.message : '推荐失败，请重试')
        setStatus('error')
      }
    }
    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFavorite = (r: GeneratedRecipe) => {
    const id = `gen_${r.name}_${Date.now()}`
    addFavorite({
      id,
      name: r.name,
      author: 'AI 推荐',
      emoji: '🍳',
      calories: r.calories,
      category: 'AI 生成',
    })
    setFavorited((prev) => new Set(prev).add(id))
  }

  const handleRecord = (r: GeneratedRecipe) => {
    // 跳转手动输入页，自动填充食物名称和营养数据
    navigate('/manual-add', {
      state: {
        prefill: {
          name: r.name,
          emoji: '🍽️',
          calories: r.calories,
          carbs: 0,
          protein: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          tips: `AI 推荐菜谱：${r.ingredients.join('、')}。${r.tips}`,
        },
      },
    })
  }

  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-bg pb-10">
      {/* 顶部栏 */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-bg/80 px-5 py-4 backdrop-blur-lg">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-card"
        >
          <SolarIcon name="arrow-left" size={20} />
        </button>
        <span className="font-display text-sm font-bold text-ink">AI 菜谱推荐</span>
        <div className="h-10 w-10" />
      </div>

      <AnimatePresence mode="wait">
        {/* 加载中 */}
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center pt-28"
          >
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-6xl"
            >
              🍳
            </motion.span>
            <p className="mt-5 font-display text-lg font-bold text-ink">烹饪中...</p>
            <p className="mt-1 text-sm text-ink/45">AI 正在根据你的食材想菜谱</p>
          </motion.div>
        )}

        {/* 失败 */}
        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center pt-24"
          >
            <span className="text-5xl">😕</span>
            <p className="mt-4 font-display text-base font-bold text-ink">推荐失败</p>
            <p className="mt-1 px-8 text-center text-sm text-ink/45">{errorMsg || '请重试'}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-fab"
            >
              返回重新选
            </button>
          </motion.div>
        )}

        {/* 成功 */}
        {status === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5"
          >
            <p className="px-1 font-display text-lg font-extrabold text-ink">
              根据你的食材，推荐这些菜 👇
            </p>
            <p className="mt-1 px-1 text-xs text-ink/40">
              已选：{ingredients.join('、')} · 厨具：{tool}
              {flavor ? ` · 口味：${flavor}` : ''}
            </p>

            <div className="mt-4 space-y-4">
              {recipes.map((r, i) => {
                const fid = `gen_${r.name}_${Date.now()}`
                const isFav = favorited.has(fid)
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="overflow-hidden rounded-3xl bg-surface shadow-card"
                  >
                    {/* 头部 */}
                    <div className="p-5 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-lg font-extrabold text-ink">{r.name}</h3>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${DIFF_COLOR[r.difficulty]}`}>
                          {r.difficulty}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-2 text-xs text-ink/45">
                        <span>⏱ {r.cookTime}</span>
                        <span>·</span>
                        <span>🔥 {r.calories} kcal（预估）</span>
                      </p>
                    </div>

                    {/* 食材 */}
                    {r.ingredients.length > 0 && (
                      <div className="border-t border-ink/5 px-5 py-3">
                        <p className="text-xs font-bold text-ink/50">
                          食材：<span className="font-medium text-ink/70">{r.ingredients.join(' · ')}</span>
                        </p>
                      </div>
                    )}

                    {/* 做法 */}
                    {r.steps.length > 0 && (
                      <div className="border-t border-ink/5 px-5 py-3">
                        <p className="text-xs font-bold text-ink/50">做法：</p>
                        <ol className="mt-1 space-y-1">
                          {r.steps.map((s, si) => (
                            <li key={si} className="flex gap-2 text-xs leading-relaxed text-ink/70">
                              <span className="font-bold text-primary">{si + 1}.</span>
                              {s}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* tips */}
                    {r.tips && (
                      <div className="mx-5 mb-3 rounded-2xl bg-amber-50 px-3 py-2.5">
                        <p className="text-[11px] leading-relaxed text-amber-700">
                          💡 {r.tips}
                        </p>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-2 px-5 pb-5">
                      <button
                        onClick={() => handleFavorite(r)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold transition active:scale-95 ${
                          isFav ? 'bg-rose-50 text-rose-500' : 'bg-rose-50 text-rose-500'
                        }`}
                      >
                        <SolarIcon name={isFav ? 'heart' : 'heart'} size={15} />
                        {isFav ? '已收藏' : '♡ 收藏'}
                      </button>
                      <button
                        onClick={() => handleRecord(r)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-xs font-bold text-white shadow-fab active:scale-95"
                      >
                        <SolarIcon name="edit" size={14} />
                        📝 记录这餐
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* 底部重新选 */}
            <button
              onClick={() => navigate(-1)}
              className="mt-6 w-full rounded-full border border-ink/10 bg-surface py-3.5 text-sm font-semibold text-ink/60 active:scale-[0.98]"
            >
              返回重新选
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
