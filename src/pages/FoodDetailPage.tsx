import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SolarIcon from '../components/SolarIcon'
import NutritionGrid, { type NutritionKey } from '../components/NutritionGrid'
import { useData } from '../context/DataContext'
import { MEAL_LABEL, type MealType } from '../types'

export default function FoodDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { foods, updateFood, deleteFood } = useData()
  const food = foods.find((f) => f.id === id)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(food?.name ?? '')
  const [calories, setCalories] = useState(food?.calories ?? 0)
  const [carbs, setCarbs] = useState(food?.carbs ?? 0)
  const [protein, setProtein] = useState(food?.protein ?? 0)
  const [fat, setFat] = useState(food?.fat ?? 0)
  const [fiber, setFiber] = useState(food?.fiber ?? 0)
  const [sugar, setSugar] = useState(food?.sugar ?? 0)
  const [sodium, setSodium] = useState(food?.sodium ?? 0)
  const [tips, setTips] = useState(food?.tips ?? '')
  const [editedKeys, setEditedKeys] = useState<NutritionKey[]>([])
  const [saved, setSaved] = useState(false)

  if (!food) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-bg">
        <p className="text-ink/45">未找到该食物</p>
        <button onClick={() => navigate('/diary')} className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
          返回
        </button>
      </div>
    )
  }

  const nutritionMap: Record<NutritionKey, number> = {
    carbs,
    protein,
    fat,
    fiber,
    sugar,
    salt: sodium,
  }

  const editNutrition = (key: NutritionKey, value: number) => {
    const setters: Record<NutritionKey, (v: number) => void> = {
      carbs: setCarbs,
      protein: setProtein,
      fat: setFat,
      fiber: setFiber,
      sugar: setSugar,
      salt: setSodium,
    }
    setters[key](value)
    setEditedKeys((p) => (p.includes(key) ? p : [...p, key]))
  }

  const saveChanges = () => {
    if (!food) return
    updateFood(food.id, {
      name: name.trim() || food.name,
      calories: Math.max(0, calories),
      carbs: Math.max(0, carbs),
      protein: Math.max(0, protein),
      fat: Math.max(0, fat),
      fiber: Math.max(0, fiber),
      sugar: Math.max(0, sugar),
      sodium: Math.max(0, sodium),
      tips,
    })
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

  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-bg pb-10">
      {/* 顶部栏 */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-bg/80 px-5 py-4 backdrop-blur-lg">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-card">
          <SolarIcon name="arrow-left" size={20} />
        </button>
        <span className="font-display text-sm font-bold text-ink">食物详情</span>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-card">
          <SolarIcon name="dots" size={20} />
        </button>
      </div>

      {saved && (
        <div className="sticky top-16 z-10 mx-5 rounded-2xl bg-green-50 px-4 py-3 text-center text-xs font-semibold text-green-600">
          已保存修改 ✅
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5"
      >
        {/* 圆形照片 */}
        <div className="flex flex-col items-center">
          <div className="notebook-bg rounded-full border border-dashed border-primary/20 bg-[#FFFDF6] p-2 shadow-card">
            {food.cutoutImage ? (
              <div className="flex h-36 w-36 items-center justify-center overflow-hidden">
                <img
                  src={food.cutoutImage}
                  alt={food.name}
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </div>
            ) : (
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-primary-soft to-bg text-7xl">
                {food.emoji || '🍽️'}
              </div>
            )}
          </div>
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-4 w-64 rounded-2xl bg-surface px-4 py-2 text-center font-display text-2xl font-black text-ink outline-none ring-2 ring-primary/40"
            />
          ) : (
            <h1 className="mt-4 font-display text-2xl font-black text-ink">{name}</h1>
          )}
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-ink/45">
            {MEAL_LABEL[food.mealType as MealType]} · {food.date}
          </p>
          {/* 卡路里大数字可点击编辑 */}
          <button
            onClick={() => {
              if (!editing) {
                setEditing(true)
                return
              }
              const v = Number(prompt('修改卡路里（kcal）', String(calories)))
              if (!Number.isNaN(v)) setCalories(Math.max(0, Math.round(v)))
            }}
            className={`mt-3 flex flex-col items-center rounded-2xl px-4 py-1 transition active:scale-95 ${
              editing ? 'bg-primary-soft ring-2 ring-primary/30' : ''
            }`}
          >
            <span className="font-display text-[28px] font-extrabold leading-none text-primary">
              {calories}
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-[10px] text-ink/40">
              kcal
              <SolarIcon name="edit" size={10} />
            </span>
          </button>
        </div>

        {/* 营养素六宫格（可编辑） */}
        <div className="mt-6">
          <p className="mb-2 flex items-center gap-1 px-1 text-sm font-bold text-ink">
            营养成分
            <span className="text-[10px] font-normal text-ink/40">（点击数值可修改）</span>
          </p>
          <NutritionGrid
            nutrition={nutritionMap}
            onChange={editing ? editNutrition : undefined}
            editedKeys={editedKeys}
          />
        </div>

        {/* AI Tips */}
        {(food.tips || editing) && (
          <div className="mt-5 flex gap-3 rounded-2xl border border-primary/10 bg-primary-soft p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <SolarIcon name="bolt" size={18} />
            </span>
            <div className="flex-1">
              <p className="text-xs font-bold text-primary">AI Tips</p>
              {editing ? (
                <textarea
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  rows={3}
                  placeholder="记录这条饮食的小贴士..."
                  className="mt-1 w-full resize-none rounded-xl bg-white/70 px-3 py-2 text-xs leading-relaxed text-ink/70 outline-none ring-1 ring-primary/30"
                />
              ) : (
                <p className="mt-1 text-xs leading-relaxed text-ink/70">{food.tips || '暂无备注'}</p>
              )}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-7 flex gap-3">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink/10 bg-surface py-3.5 text-sm font-semibold text-ink"
              >
                取消
              </button>
              <button
                onClick={saveChanges}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white shadow-fab"
              >
                <SolarIcon name="check" size={16} /> 保存修改
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink/10 bg-surface py-3.5 text-sm font-semibold text-ink"
              >
                <SolarIcon name="edit" size={16} /> 编辑
              </button>
              <button
                onClick={handleDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-50 py-3.5 text-sm font-semibold text-rose-500"
              >
                <SolarIcon name="trash" size={16} /> 删除
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
