import { useEffect, useRef, useState } from 'react'
import type { Nutrition } from '../types'

export type NutritionKey = keyof Nutrition

const ROWS: { key: NutritionKey; label: string; unit: string }[][] = [
  [
    { key: 'carbs', label: '碳水', unit: 'g' },
    { key: 'protein', label: '蛋白质', unit: 'g' },
    { key: 'fat', label: '脂肪', unit: 'g' },
  ],
  [
    { key: 'fiber', label: '纤维', unit: 'g' },
    { key: 'sugar', label: '糖', unit: 'g' },
    { key: 'salt', label: '盐', unit: 'mg' },
  ],
]

export default function NutritionGrid({
  nutrition,
  onChange,
  editedKeys,
}: {
  nutrition: Nutrition
  onChange?: (key: NutritionKey, value: number) => void
  editedKeys?: NutritionKey[]
}) {
  const [editingKey, setEditingKey] = useState<NutritionKey | null>(null)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingKey) inputRef.current?.focus()
  }, [editingKey])

  const startEdit = (key: NutritionKey) => {
    if (!onChange) return
    setEditingKey(key)
    setDraft(String(nutrition[key]))
  }

  const commit = () => {
    if (editingKey && onChange) {
      const v = Number(draft)
      if (!Number.isNaN(v)) onChange(editingKey, Math.max(0, v))
    }
    setEditingKey(null)
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {ROWS.flat().map((cell) => {
        const edited = editedKeys?.includes(cell.key)
        const isEditing = editingKey === cell.key
        return (
          <button
            key={cell.key}
            onClick={() => !isEditing && startEdit(cell.key)}
            disabled={!onChange}
            className={`relative flex flex-col items-center rounded-2xl py-3 transition active:scale-95 ${
              onChange ? 'cursor-pointer' : 'cursor-default'
            } ${edited ? 'bg-primary-soft ring-2 ring-primary/30' : isEditing ? 'bg-primary-soft ring-2 ring-primary' : 'bg-bg'}`}
          >
            <span className="text-xs font-medium text-ink/45">{cell.label}</span>
            {isEditing ? (
              <input
                ref={inputRef}
                type="number"
                inputMode="decimal"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit()
                  if (e.key === 'Escape') setEditingKey(null)
                }}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 w-16 rounded-lg bg-white px-1 py-0.5 text-center font-display text-lg font-extrabold text-primary outline-none ring-1 ring-primary/40"
              />
            ) : (
              <span
                className={`mt-0.5 font-display text-lg font-extrabold ${
                  edited ? 'text-primary' : 'text-ink'
                }`}
              >
                {nutrition[cell.key]}
              </span>
            )}
            <span className="text-[10px] text-ink/40">{cell.unit}</span>
          </button>
        )
      })}
    </div>
  )
}
