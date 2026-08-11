import SolarIcon from '../SolarIcon'

interface FoodActionButtonsProps {
  editing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onSave: () => void
  onDelete: () => void
}

/**
 * 操作按钮：编辑/删除 或 取消/保存修改
 */
export default function FoodActionButtons({
  editing,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: FoodActionButtonsProps) {
  if (editing) {
    return (
      <div className="mt-7 flex gap-3">
        <button
          onClick={onCancelEdit}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink/10 bg-surface py-3.5 text-sm font-semibold text-ink"
        >
          取消
        </button>
        <button
          onClick={onSave}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white shadow-fab"
        >
          <SolarIcon name="check" size={16} /> 保存修改
        </button>
      </div>
    )
  }

  return (
    <div className="mt-7 flex gap-3">
      <button
        onClick={onStartEdit}
        className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink/10 bg-surface py-3.5 text-sm font-semibold text-ink"
      >
        <SolarIcon name="edit" size={16} /> 编辑
      </button>
      <button
        onClick={onDelete}
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-50 py-3.5 text-sm font-semibold text-rose-500"
      >
        <SolarIcon name="trash" size={16} /> 删除
      </button>
    </div>
  )
}
