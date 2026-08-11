import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import type { MealType } from '../types'
import type { FoodEntry } from '../types'
import type { NutritionValues } from '../components/NutritionGrid'

export interface FoodDetail {
  food: FoodEntry | undefined
  editing: boolean
  setEditing: (v: boolean) => void
  mealType: MealType
  setMealType: (m: MealType) => void
  date: string
  setDate: (d: string) => void
  saved: boolean
  nutritionMap: NutritionValues
  startEdit: () => void
  cancelEdit: () => void
  saveChanges: () => void
  handleDelete: () => void
  goBack: () => void
}

/**
 * 食物详情页核心业务 Hook：
 * 根据路由 id 查找食物，管理编辑状态（餐类/日期）、保存与删除。
 */
export default function useFoodDetail(): FoodDetail {
  const { id } = useParams()
  const navigate = useNavigate()
  const { foods, updateFood, deleteFood } = useData()
  const food = foods.find((f) => f.id === id)
  const [editing, setEditing] = useState(false)
  const [mealType, setMealType] = useState<MealType>(food?.mealType ?? 'lunch')
  const [date, setDate] = useState(food?.date ?? '')
  const [saved, setSaved] = useState(false)

  const nutritionMap: NutritionValues = {
    carbs: food?.carbs ?? 0,
    protein: food?.protein ?? 0,
    fat: food?.fat ?? 0,
    fiber: food?.fiber ?? 0,
    sugar: food?.sugar ?? 0,
    salt: food?.sodium ?? 0,
  }

  const startEdit = () => {
    if (!food) return
    setMealType(food.mealType)
    setDate(food.date)
    setEditing(true)
  }

  const cancelEdit = () => setEditing(false)

  const saveChanges = () => {
    if (!food) return
    // 名称/卡路里/营养素由 AI 定死，只能改餐类和日期
    updateFood(food.id, { mealType, date })
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleDelete = () => {
    if (!food) return
    if (window.confirm(`确定删除「${food.name}」吗？`)) {
      deleteFood(food.id)
      navigate('/diary')
    }
  }

  const goBack = () => navigate(-1)

  return {
    food,
    editing,
    setEditing,
    mealType,
    setMealType,
    date,
    setDate,
    saved,
    nutritionMap,
    startEdit,
    cancelEdit,
    saveChanges,
    handleDelete,
    goBack,
  }
}
