import { removeBackground } from '@imgly/background-removal'

// 本地 AI 抠图：去除食物背景，失败/超时返回 null 由调用方降级
export async function removeFoodBackground(
  imageBase64: string,
  onProgress?: (progress: number) => void,
  timeoutMs = 30000,
): Promise<string> {
  // base64 → Blob
  const res = await fetch(imageBase64)
  const blob = await res.blob()

  // 调用本地 AI 模型抠图（带超时兜底）
  const cutoutPromise = removeBackground(blob, {
    output: {
      format: 'image/png',
      quality: 0.9,
    },
    progress: (_key: string, current: number, total: number) => {
      if (total > 0 && onProgress) {
        onProgress(Math.round((current / total) * 100))
      }
    },
  })

  // 30 秒超时：超时直接抛错，调用方降级用原图
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('抠图超时')), timeoutMs)
  })

  const resultBlob = await Promise.race([cutoutPromise, timeoutPromise])

  // Blob → base64
  return await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.readAsDataURL(resultBlob)
  })
}
