import SolarIcon from './SolarIcon'

/**
 * AI 识别页顶部栏：返回按钮 + 标题
 */
export default function RecognizeHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <button
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
      >
        <SolarIcon name="arrow-left" size={20} />
      </button>
      <span className="font-display text-sm font-bold text-white">AI 识别</span>
      <div className="h-10 w-10" />
    </div>
  )
}
