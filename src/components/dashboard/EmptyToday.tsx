/**
 * 全天无记录空状态提示
 */
export default function EmptyToday() {
  return (
    <div className="mt-5 flex flex-col items-center rounded-2xl bg-surface py-8 shadow-card">
      <span className="text-4xl">📝</span>
      <p className="mt-2 text-sm font-semibold text-ink/60">今天还没有记录哦，点击下方 + 开始记录吧</p>
    </div>
  )
}
