import { removeBackground } from '@imgly/background-removal'

// 简易抠图 fallback：基于颜色/亮度分离（无外部依赖，即时完成）
// 适合食物主体与背景对比明显的照片；效果不如 AI 抠图但可靠
function simpleCutout(imageBase64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        // 采样四角作为背景色估计
        const corners = [
          [0, 0],
          [canvas.width - 1, 0],
          [0, canvas.height - 1],
          [canvas.width - 1, canvas.height - 1],
        ]
        let r = 0, g = 0, b = 0
        corners.forEach(([x, y]) => {
          const i = (y * canvas.width + x) * 4
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
        })
        r /= 4; g /= 4; b /= 4

        // 与背景色接近的像素设为透明
        const tolerance = 70
        for (let i = 0; i < data.length; i += 4) {
          const dr = data[i] - r
          const dg = data[i + 1] - g
          const db = data[i + 2] - b
          const dist = Math.sqrt(dr * dr + dg * dg + db * db)
          if (dist < tolerance) {
            data[i + 3] = 0 // 透明
          }
        }
        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = reject
    img.src = imageBase64
  })
}

// 抠图：优先 AI 模型，失败/超时降级为简易抠图（保证有抠图效果）
export async function removeFoodBackground(
  imageBase64: string,
  onProgress?: (progress: number) => void,
  timeoutMs = 45000,
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

  // 超时：超时直接抛错，调用方降级用原图
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('抠图超时')), timeoutMs)
  })

  try {
    const resultBlob = await Promise.race([cutoutPromise, timeoutPromise])

    // Blob → base64
    return await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(resultBlob)
    })
  } catch {
    // AI 抠图失败/超时 → 降级简易抠图
    onProgress?.(100)
    return simpleCutout(imageBase64)
  }
}
