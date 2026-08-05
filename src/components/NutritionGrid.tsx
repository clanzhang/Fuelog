import type { Nutrition } from '../types'

const ROWS: { key: keyof Nutrition; label: string; unit: string }[][] = [
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

export default function NutritionGrid({ nutrition }: { nutrition: Nutrition }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {ROWS.flat().map((cell) => (
        <div
          key={cell.key}
          className="flex flex-col items-center rounded-2xl bg-bg py-3"
        >
          <span className="text-xs font-medium text-ink/45">{cell.label}</span>
          <span className="mt-0.5 font-display text-lg font-extrabold text-ink">
            {nutrition[cell.key]}
          </span>
          <span className="text-[10px] text-ink/40">{cell.unit}</span>
        </div>
      ))}
    </div>
  )
}
