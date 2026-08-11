import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export interface IngredientPick {
  selected: Record<string, string[]>
  toggleIngredient: (group: string, name: string) => void
  tool: string
  setTool: (t: string) => void
  flavor: string
  setFlavor: (f: string) => void
  allSelected: string[]
  canGenerate: boolean
  startGenerate: () => void
  goBack: () => void
}

/**
 * 选食材做菜页核心业务 Hook：
 * 管理食材多选、厨具单选、口味可选状态与生成跳转。
 */
export default function useIngredientPick(): IngredientPick {
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

  const goBack = () => navigate(-1)

  return {
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
  }
}
