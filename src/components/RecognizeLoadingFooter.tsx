import SolarIcon from './SolarIcon'

/**
 * AI 识别处理中（analyzing/compressing）底部的禁用占位按钮区
 */
export default function RecognizeLoadingFooter() {
  return (
    <div className="flex items-center justify-center gap-4 py-2 opacity-40">
      <button className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink/50">
        <SolarIcon name="close" size={22} />
      </button>
      <button className="flex h-14 items-center justify-center rounded-full bg-ink/10 px-10 text-ink/40">
        <SolarIcon name="check" size={22} />
      </button>
      <button className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink/30">
        <SolarIcon name="edit" size={20} />
      </button>
    </div>
  )
}
