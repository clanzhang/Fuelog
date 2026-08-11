import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomTabBar from './BottomTabBar'
import ActionSheet from './ActionSheet'
import { compressImage } from '../utils/image'

interface AddEntryPanelProps {
  showTabBar: boolean
}

/**
 * 底部操作层组合组件：
 * 拍照/相册文件输入 + 底部 TabBar + 添加饮食记录 ActionSheet。
 * 内部管理弹窗状态与图片选择跳转逻辑。
 */
export default function AddEntryPanel({ showTabBar }: AddEntryPanelProps) {
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  // 拍照 / 相册两个独立 input：拍照带 capture，相册不带
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  // 读取文件 → 压缩 → 带着图片进入识别流程
  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>, source: string) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 允许重复选择同一文件
    if (!file) return
    try {
      const base64 = await compressImage(file)
      navigate('/recognize', { state: { imageData: base64, source } })
    } catch {
      console.warn('[AddEntryPanel] 图片处理失败', e)
    }
  }

  const handleSelect = (key: string) => {
    if (key === 'camera') {
      cameraInputRef.current?.click()
    } else if (key === 'gallery') {
      galleryInputRef.current?.click()
    } else if (key === 'manual') {
      navigate('/manual-add')
    }
  }

  return (
    <>
      {/* 拍照 input：capture 调起系统相机 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handlePick(e, 'camera')}
      />
      {/* 相册 input：不带 capture */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePick(e, 'gallery')}
      />

      {showTabBar && <BottomTabBar onFab={() => setSheetOpen(true)} />}

      <ActionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="添加饮食记录"
        options={[
          { key: 'camera', emoji: '📷', label: '拍照识别' },
          { key: 'gallery', emoji: '🖼️', label: '相册选择' },
          { key: 'search', emoji: '🔍', label: '搜索食物' },
          { key: 'manual', emoji: '✏️', label: '手动输入' },
        ]}
        onSelect={handleSelect}
      />
    </>
  )
}
