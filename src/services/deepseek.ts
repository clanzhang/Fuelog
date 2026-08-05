import type { Nutrition } from '../types'
import { mockAnalyzeResult } from '../data/mock'

export interface AnalyzeResult {
  name: string
  emoji: string
  image: string
  calories: number
  amount: string
  nutrition: Nutrition
  aiTip: string
}

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined
const API_URL = 'https://api.deepseek.com/chat/completions'

function buildPrompt(base64: string): string {
  return [
    '你是一名专业的营养师和食物识别 AI。请识别这张食物照片，并返回严格的 JSON。',
    '图片为 base64 编码，可直接分析。',
    '输出格式（不要输出任何其他文字或 markdown）：',
    '{',
    '  "name": "食物中文名",',
    '  "emoji": "一个合适的食物 emoji",',
    '  "image": "一个英文标签如 salad/salmon/rice",',
    '  "calories": 数字（千卡）,',
    '  "amount": "份量描述如 1 盘 · 350g",',
    '  "nutrition": { "carbs": 数字, "protein": 数字, "fat": 数字, "fiber": 数字, "sugar": 数字, "salt": 数字 },',
    '  "aiTip": "一句 30 字以内的健康小贴士"',
    '}',
    '注：nutrition 单位 g（salt 为 mg）；数值为估算值。',
    'DATA_IMAGE_BASE64:' + base64,
  ].join('\n')
}

function extractJson(text: string): AnalyzeResult {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('无法解析 AI 返回结果')
  return JSON.parse(match[0])
}

export async function analyzeFoodImage(base64: string): Promise<AnalyzeResult> {
  if (!API_KEY) {
    await new Promise((r) => setTimeout(r, 1800))
    return mockAnalyzeResult
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: buildPrompt('') },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${base64}` },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    })
    if (!res.ok) throw new Error(`API 错误 ${res.status}`)
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('无返回内容')
    return extractJson(content)
  } catch (e) {
    console.warn('[DeepSeek] 调用失败，回退到 mock 数据', e)
    await new Promise((r) => setTimeout(r, 1200))
    return mockAnalyzeResult
  }
}

/** 图片压缩到 1024px 以内并转 base64 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const max = 1024
      let { width, height } = img
      if (width > height && width > max) {
        height = Math.round((height * max) / width)
        width = max
      } else if (height > max) {
        width = Math.round((width * max) / height)
        height = max
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1])
    }
    img.onerror = reject
    img.src = url
  })
}
