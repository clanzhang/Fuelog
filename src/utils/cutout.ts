import { removeBackground } from '@imgly/background-removal'

// 整体抠图超时（首次含模型下载约 25s + 推理；已缓存时秒级完成）
const INFER_TIMEOUT = 45000

// ---- 环境检测 ----

// 1. 是否支持 WebAssembly（@imgly 依赖 WASM 运行时，微信 X5 旧内核可能不支持）
function isCutoutSupported(): boolean {
  try {
    return typeof WebAssembly !== 'undefined'
  } catch {
    return false
  }
}

// 2. 是否支持 WebGPU（决定 device 参数；不支持时回退 CPU，避免硬编码 gpu 直接失败）
async function hasWebGPU(): Promise<boolean> {
  try {
    const gpu = (navigator as unknown as { gpu?: { requestAdapter?: () => Promise<unknown> } }).gpu
    if (!gpu?.requestAdapter) return false
    const adapter = await gpu.requestAdapter()
    return !!adapter
  } catch {
    return false
  }
}

// 3. 是否微信内置浏览器（模型下载在 X5 内核极不稳定，优先走 CPU + 更小模型）
function isWeChat(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent)
}

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
// 注意：removeBackground 内部自带模型缓存（首次下载后，后续秒级完成），无需手动 preload
async function aiCutout(imageBase64: string, onProgress?: (progress: number) => void): Promise<string> {
  // 确保传入完整 data URL（@imgly 内部用 fetch(dataUrl) 转 blob，缺前缀会失败）
  const dataUrl = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`

  console.log('[cutout] starting, dataUrl length:', dataUrl.length)
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  console.log('[cutout] blob size:', blob.size, 'type:', blob.type)

  const gpu = await hasWebGPU()
  const model = isWeChat() ? ('isnet_quint8' as const) : ('isnet_fp16' as const)
  const device = (gpu ? 'gpu' : 'cpu') as 'gpu' | 'cpu'
  console.log('[cutout] using model:', model, 'device:', device)

  const config = {
    output: {
      format: 'image/png' as const,
      quality: 0.9,
    },
    model,
    device,
    debug: false,
    progress: (_key: string, current: number, total: number) => {
      if (total > 0 && onProgress) {
        onProgress(Math.round((current / total) * 100))
      }
    },
  }

  const resultBlob = await removeBackground(blob, config)
  console.log('[cutout] result blob size:', resultBlob.size, 'type:', resultBlob.type)

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

// 整体流程：AI 抠图 + 边缘后处理，超时降级
async function processCutout(
  imageBase64: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  // 环境不支持 → 直接跳过 AI，用简易抠图兜底
  if (!isCutoutSupported()) {
    console.log('[cutout] WebAssembly not supported, skip AI -> simpleCutout')
    onProgress?.(100)
    return simpleCutout(imageBase64)
  }

  try {
    const result = await Promise.race([
      (async () => {
        const rawCutout = await aiCutout(imageBase64, onProgress)
        return await refineCutoutEdges(rawCutout)
      })(),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('cutout timeout')), INFER_TIMEOUT),
      ),
    ])
    console.log('[cutout] success, base64 length:', (result as string).length)
    return result as string
  } catch (err) {
    // 抠图失败/超时 → 降级简易抠图（保证有抠图效果）
    console.error('[cutout] failed, fallback to simpleCutout:', err)
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
