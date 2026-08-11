import { motion } from 'framer-motion'
import IngredientPickHeader from './ingredients/IngredientPickHeader'
import IngredientSection from './ingredients/IngredientSection'
import ToolSection from './ingredients/ToolSection'
import FlavorSection from './ingredients/FlavorSection'
import GenerateButton from './ingredients/GenerateButton'
import useIngredientPick from '../hooks/useIngredientPick'

/**
 * 选食材做菜页（组合组件）
 * 内部调用 useIngredientPick Hook 管理选择状态，
 * 组合 顶部栏 / 说明 / 食材 / 厨具 / 口味 / 生成按钮。
 */
export default function IngredientPickScreen() {
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
      <IngredientPickHeader onBack={goBack} />

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
