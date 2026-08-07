import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SolarIcon from '../components/SolarIcon'
import {
  INGREDIENT_GROUPS,
  TOOL_OPTIONS,
  FLAVOR_OPTIONS,
  type IngredientGroup,
  type IngredientOption,
} from '../utils/ingredients'

export default function IngredientPickPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Record<string, string[]>>({}) // group title -> names
  const [tool, setTool] = useState('')
  const [flavor, setFlavor] = useState('')

  const toggleIngredient = (group: string, name: string) => {
    setSelected((prev) => {
      const cur = prev[group] ?? []
      return {
        ...prev,
        [group]: cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name],
      }
    })
  }

  const allSelected = Object.values(selected).flat()
  const canGenerate = allSelected.length > 0 && tool !== ''

  const startGenerate = () => {
    if (!canGenerate) return
    navigate('/recipe-result', {
      state: { ingredients: allSelected, tool, flavor },
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
        <span className="font-display text-sm font-bold text-ink">选食材做菜</span>
        <div className="h-10 w-10" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5">
        {/* 说明 */}
        <div className="flex items-center gap-3 rounded-2xl bg-primary-soft p-4">
          <span className="text-2xl">🍳</span>
          <p className="text-xs font-medium leading-relaxed text-primary/90">
            选一下你冰箱里有的食材和厨具，AI 帮你推荐能做的菜 🍲
          </p>
        </div>

        {/* Step 1: 食材 */}
        <div className="mt-5">
          <p className="mb-3 px-1 font-display text-base font-extrabold text-ink">
            1 · 选食材 <span className="text-xs font-medium text-ink/40">（可多选）</span>
          </p>
          {INGREDIENT_GROUPS.map((group: IngredientGroup) => (
            <div key={group.title} className="mb-4">
              <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold text-ink/50">
                <span>{group.emoji}</span>
                {group.title}
                {group.note && <span className="font-normal text-ink/35">（{group.note}）</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => {
                  const active = (selected[group.title] ?? []).includes(item.name)
                  return (
                    <button
                      key={item.name}
                      onClick={() => toggleIngredient(group.title, item.name)}
                      className={`flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold transition active:scale-95 ${
                        active ? 'bg-primary text-white shadow-fab' : 'bg-surface text-ink/70 shadow-card'
                      }`}
                    >
                      <span>{item.emoji}</span>
                      {item.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Step 2: 厨具 */}
        <div className="mt-2">
          <p className="mb-3 px-1 font-display text-base font-extrabold text-ink">
            2 · 选厨具 <span className="text-xs font-medium text-ink/40">（单选）</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {TOOL_OPTIONS.map((t: IngredientOption) => (
              <button
                key={t.name}
                onClick={() => setTool(t.name)}
                className={`flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold transition active:scale-95 ${
                  tool === t.name ? 'bg-primary text-white shadow-fab' : 'bg-surface text-ink/70 shadow-card'
                }`}
              >
                <span>{t.emoji}</span>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: 口味 */}
        <div className="mt-5">
          <p className="mb-3 px-1 font-display text-base font-extrabold text-ink">
            3 · 选口味 <span className="text-xs font-medium text-ink/40">（可选）</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {FLAVOR_OPTIONS.map((f: IngredientOption) => (
              <button
                key={f.name}
                onClick={() => setFlavor(f.name === flavor ? '' : f.name)}
                className={`flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold transition active:scale-95 ${
                  flavor === f.name ? 'bg-primary text-white shadow-fab' : 'bg-surface text-ink/70 shadow-card'
                }`}
              >
                <span>{f.emoji}</span>
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* 底部生成按钮 */}
        <div className="mt-7 flex flex-col items-center gap-2">
          <button
            onClick={startGenerate}
            disabled={!canGenerate}
            className={`w-full rounded-full py-4 font-display text-sm font-bold transition ${
              canGenerate
                ? 'bg-primary text-white shadow-fab active:scale-[0.98]'
                : 'bg-ink/10 text-ink/35'
            }`}
          >
            {allSelected.length > 0 ? `🍳 生成食谱（已选 ${allSelected.length} 种食材）` : '先选一些食材吧'}
          </button>
          {!tool && allSelected.length > 0 && (
            <p className="text-xs text-ink/40">还需要选择一个厨具</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
