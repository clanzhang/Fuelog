import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SolarIcon from '../components/SolarIcon'
import { useData, todayStr } from '../context/DataContext'
import { MEAL_LABEL, type MealType } from '../types'
import { compressImage } from '../utils/image'

export default function ManualAddPage() {
  const navigate = useNavigate()
  const { addFood } = useData()
  const photoRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [carbs, setCarbs] = useState('0')
  const [protein, setProtein] = useState('0')
  const [fat, setFat] = useState('0')
  const [fiber, setFiber] = useState('0')
  const [sugar, setSugar] = useState('0')
  const [sodium, setSodium] = useState('0')
  const [tips, setTips] = useState('')
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [date, setDate] = useState(todayStr())
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await compressImage(file)
    setImageUrl(`data:image/jpeg;base64,${base64}`)
  }

  const save = () => {
    if (!name.trim() || !calories) return
    addFood({
      name: name.trim(),
      emoji: '🍽️',
      imageUrl,
      calories: Number(calories) || 0,
      carbs: Number(carbs) || 0,
      protein: Number(protein) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      sugar: Number(sugar) || 0,
      sodium: Number(sodium) || 0,
      tips: tips.trim(),
      mealType,
      date,
    })
    navigate('/diary')
  }

  const nutritionFields: { key: string; label: string; unit: string; value: string; set: (v: string) => void }[] = [
    { key: 'carbs', label: '碳水', unit: 'g', value: carbs, set: setCarbs },
    { key: 'protein', label: '蛋白质', unit: 'g', value: protein, set: setProtein },
    { key: 'fat', label: '脂肪', unit: 'g', value: fat, set: setFat },
    { key: 'fiber', label: '纤维', unit: 'g', value: fiber, set: setFiber },
    { key: 'sugar', label: '糖', unit: 'g', value: sugar, set: setSugar },
    { key: 'sodium', label: '盐', unit: 'mg', value: sodium, set: setSodium },
  ]

  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-bg pb-10">
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhoto}
      />
      <div className="sticky top-0 z-10 flex items-center justify-between bg-bg/80 px-5 py-4 backdrop-blur-lg">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-card">
          <SolarIcon name="arrow-left" size={20} />
        </button>
        <span className="font-display text-sm font-bold text-ink">手动输入</span>
        <div className="h-10 w-10" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5">
        {/* 可选照片 */}
        <div className="mb-4 flex items-center gap-3">
          {imageUrl ? (
            <div className="relative">
              <img src={imageUrl} alt="食物" className="h-16 w-16 rounded-2xl object-cover" />
              <button
                onClick={() => setImageUrl(undefined)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white"
              >
                <SolarIcon name="close" size={10} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => photoRef.current?.click()}
              className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-ink/15 text-ink/40"
            >
              <SolarIcon name="camera" size={22} />
            </button>
          )}
          <span className="text-xs text-ink/45">可选：补充食物照片</span>
        </div>

        <div className="rounded-3xl bg-surface p-5 shadow-card">
          <Field label="食物名称 *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：鸡胸肉沙拉"
              className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </Field>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="卡路里 (kcal) *">
              <input
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                type="number"
                placeholder="320"
                className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </Field>
            <Field label="餐类">
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                {(Object.keys(MEAL_LABEL) as MealType[]).map((m) => (
                  <option key={m} value={m}>
                    {MEAL_LABEL[m]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="日期">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </Field>
        </div>

        <div className="mt-4 rounded-3xl bg-surface p-5 shadow-card">
          <p className="mb-3 text-sm font-bold text-ink">营养成分（选填）</p>
          <div className="grid grid-cols-3 gap-3">
            {nutritionFields.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-medium text-ink/50">
                  {f.label} ({f.unit})
                </label>
                <input
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  type="number"
                  className="w-full rounded-2xl bg-bg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-3xl bg-surface p-5 shadow-card">
          <Field label="备注 / AI 小贴士">
            <textarea
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              rows={3}
              placeholder="记录这餐的小贴士..."
              className="w-full resize-none rounded-2xl bg-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </Field>
        </div>

        <button
          onClick={save}
          className="mt-5 w-full rounded-full bg-primary py-4 font-display text-sm font-bold text-white shadow-fab"
        >
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

