import { removeBackground } from '@imgly/background-removal'

// 抠图超时（large 模型约 80MB，首次下载慢）
const CUTOUT_TIMEOUT = 30000

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

// AI 抠图：高精度模型，背景填充透明（PNG 天然透明）
async function aiCutout(imageBase64: string, onProgress?: (progress: number) => void): Promise<string> {
  // base64 → Blob
  const res = await fetch(imageBase64)
  const blob = await res.blob()

  const config = {
    output: {
      format: 'image/png' as const,
      quality: 0.9,
    },
    // 用 fp16 模型（比默认 quint8 量化版精度更高）
    model: 'isnet_fp16' as const,
    device: 'gpu' as const,
    debug: false,
    progress: (_key: string, current: number, total: number) => {
      if (total > 0 && onProgress) {
        onProgress(Math.round((current / total) * 100))
      }
    },
  }

  const resultBlob = await removeBackground(blob, config)

  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.readAsDataURL(resultBlob)
  })
}

// 抠图后处理：边缘平滑，去除锯齿和残留杂色
async function refineCutoutEdges(cutoutBase64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!

      // 先画原图
      ctx.drawImage(img, 0, 0)

      // 获取像素数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // 1. 去除边缘半透明像素（alpha < 30 的直接设为 0）
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 30) {
          data[i] = 0
          data[i - 1] = 0
          data[i - 2] = 0
          data[i - 3] = 0
        }
      }

      // 2. 去除白色/浅色边缘残留
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0 && data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
          data[i] = 0
          data[i + 1] = 0
          data[i + 2] = 0
          data[i + 3] = 0
        }
      }

      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png', 0.9))
    }
    img.src = cutoutBase64
  })
}

// 整体流程：AI 抠图（large 模型）+ 边缘后处理，30 秒超时降级
async function processCutout(
  imageBase64: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  try {
    const result = await Promise.race([
      (async () => {
        const rawCutout = await aiCutout(imageBase64, onProgress)
        return await refineCutoutEdges(rawCutout)
      })(),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('cutout timeout')), CUTOUT_TIMEOUT),
      ),
    ])
    return result as string
  } catch {
    // 抠图失败/超时 → 降级简易抠图（保证有抠图效果）
    onProgress?.(100)
    return simpleCutout(imageBase64)
  }
}

// 导出统一抠图入口（识别页调用）
export function removeFoodBackground(
  imageBase64: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  return processCutout(imageBase64, onProgress)
}
