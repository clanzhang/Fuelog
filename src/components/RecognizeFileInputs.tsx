import type { RefObject } from 'react'

interface RecognizeFileInputsProps {
  cameraRef: RefObject<HTMLInputElement>
  galleryRef: RefObject<HTMLInputElement>
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * 兜底拍照/相册文件输入（无 state 直接访问识别页时使用）
 * 隐藏的 camera/gallery 输入框，通过 ref 暴露给外部触发 click()。
 */
export default function RecognizeFileInputs({ cameraRef, galleryRef, onPick }: RecognizeFileInputsProps) {
  return (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPick}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
    </>
  )
}
