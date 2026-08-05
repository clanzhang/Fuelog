import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SolarIcon from '../components/SolarIcon'

export default function ManualAddPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [amount, setAmount] = useState('')
  const [nutrition, setNutrition] = useState({
    carbs: 0,
    protein: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    salt: 0,
  })

  const updateN = (key: keyof typeof nutrition, v: string) =>
    setNutrition((p) => ({ ...p, [key]: Number(v) || 0 }))

  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-bg pb-10">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-bg/80 px-5 py-4 backdrop-blur-lg">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-card">
          <SolarIcon name="arrow-left" size={20} />
        </button>
        <span className="font-display text-sm font-bold text-ink">手动输入</span>
        <div className="h-10 w-10" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5">
        <div className="rounded-3xl bg-surface p-5 shadow-card">
          <Field label="食物名称">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：鸡胸肉沙拉"
              className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </Field>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="卡路里 (kcal)">
              <input
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                type="number"
                placeholder="320"
                className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>
            <Field label="份量">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1 盘 · 350g"
                className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>
          </div>
        </div>

        <div className="mt-4 rounded-3xl bg-surface p-5 shadow-card">
          <p className="mb-3 text-sm font-bold text-ink">营养成分 (g / mg)</p>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                ['carbs', '碳水'],
                ['protein', '蛋白质'],
                ['fat', '脂肪'],
                ['fiber', '纤维'],
                ['sugar', '糖'],
                ['salt', '盐'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium text-ink/50">{label}</label>
                <input
                  value={nutrition[key]}
                  onChange={(e) => updateN(key, e.target.value)}
                  type="number"
                  className="w-full rounded-2xl bg-bg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            ))}
          </div>
        </div>

        <button className="mt-5 w-full rounded-full bg-primary py-4 font-display text-sm font-bold text-white shadow-fab">
          保存记录
        </button>
      </motion.div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink/50">{label}</label>
      {children}
    </div>
  )
}
