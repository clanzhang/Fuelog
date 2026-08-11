import type { ReactNode } from 'react'

interface PhoneFrameProps {
  children: ReactNode
}

/**
 * 桌面端手机模拟框布局（移动端占满全屏，桌面端居中显示手机壳）
 */
export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="flex h-full items-center justify-center bg-[#1E1E2E]">
      <div className="relative h-full max-h-[900px] w-full max-w-[430px] overflow-hidden bg-bg shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:my-6 sm:h-[calc(100%-3rem)] sm:rounded-[3rem] sm:border-[10px] sm:border-ink/90">
        {children}
      </div>
    </div>
  )
}
