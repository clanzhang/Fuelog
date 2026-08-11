import { motion } from 'framer-motion'
import SolarIcon from '../components/SolarIcon'
import IngredientSection from '../components/ingredients/IngredientSection'
import ToolSection from '../components/ingredients/ToolSection'
import FlavorSection from '../components/ingredients/FlavorSection'
import GenerateButton from '../components/ingredients/GenerateButton'
import useIngredientPick from '../hooks/useIngredientPick'

export default function IngredientPickPage() {
  const {
    selected,
    toggleIngredient,
    tool,
    setTool,
    flavor,
    setFlavor,
    allSelected,
    canGenerate,
    startGenerate,
    goBack,
  } = useIngredientPick()

  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-bg pb-10">
      {/* 顶部栏 */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-bg/80 px-5 py-4 backdrop-blur-lg">
        <button
          onClick={goBack}
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

        <IngredientSection selected={selected} onToggle={toggleIngredient} />

        <ToolSection tool={tool} onSelect={setTool} />

        <FlavorSection flavor={flavor} onSelect={setFlavor} />

        <GenerateButton
          allSelected={allSelected}
          canGenerate={canGenerate}
          hasTool={tool !== ''}
          onGenerate={startGenerate}
        />
      </motion.div>
    </div>
  )
}
