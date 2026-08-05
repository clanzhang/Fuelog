export interface AnalyzeResult {
  name: string
  emoji: string
  calories: number
  carbs: number
  protein: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  tips: string
  confidence?: 'high' | 'medium' | 'low'
}

export const EMPTY_RESULT: AnalyzeResult = {
  name: '',
  emoji: '🍽️',
  calories: 0,
  carbs: 0,
  protein: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  tips: '',
  confidence: 'low',
}

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined
const API_URL = 'https://api.deepseek.com/chat/completions'

const SYSTEM_PROMPT = [
  '你是一个专业的食物营养分析师。用户会发送一张食物照片。',
  '',
  '分析规则：',
  '1. 仔细观察照片中的食物，识别所有可见的食物成分',
  '2. 如果有多种食物（如一份套餐），分别识别再汇总',
  '3. 根据食物的种类和可见的份量大小来估算，不要给固定值',
  '4. 常见错误提醒：',
  '   - 白色肉类（鸡胸肉、鱼肉）不要和豆腐混淆',
  '   - 注意区分煎、炸、烤、蒸等不同烹饪方式，热量差异很大',
  '   - 注意可见的油脂、酱料也要计入',
  '5. 如果你对某种食物不确定，给出最接近的估算并在 tips 中说明',
  '',
  '请以 JSON 格式返回：',
  '{',
  '  "name": "食物名称（如果有多种，用逗号分隔）",',
  '  "emoji": "一个合适的食物 emoji",',
  '  "image": "一个英文标签如 salad/salmon/rice",',
  '  "calories": 数字,',
  '  "carbs": 数字,',
  '  "protein": 数字,',
  '  "fat": 数字,',
  '  "fiber": 数字,',
  '  "sugar": 数字,',
  '  "sodium": 数字,',
  '  "confidence": "high/medium/low",',
  '  "tips": "对这个估算的说明，比如用了什么烹饪方式、份量判断依据等"',
  '}',
].join('\n')

function buildPrompt(): string {
  return [
    '以下是用户上传的食物照片（base64 编码），请按系统规则分析。',
    'DATA_IMAGE_BASE64:',
  ].join('\n')
}

function extractJson(text: string): AnalyzeResult {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('无法解析 AI 返回结果')
  const raw = JSON.parse(match[0])
  return {
    name: String(raw.name ?? ''),
    emoji: String(raw.emoji ?? '🍽️'),
    calories: Number(raw.calories) || 0,
    carbs: Number(raw.carbs) || 0,
    protein: Number(raw.protein) || 0,
    fat: Number(raw.fat) || 0,
    fiber: Number(raw.fiber) || 0,
    sugar: Number(raw.sugar) || 0,
    sodium: Number(raw.sodium) || 0,
    tips: String(raw.tips ?? raw.aiTip ?? ''),
    confidence: ['high', 'medium', 'low'].includes(raw.confidence)
      ? (raw.confidence as AnalyzeResult['confidence'])
      : 'low',
  }
}

export async function analyzeFoodImage(base64: string): Promise<AnalyzeResult> {
  if (!API_KEY) {
    await new Promise((r) => setTimeout(r, 1200))
    throw new Error('未配置 API Key')
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
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: buildPrompt() },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${base64}` },
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      }),
    })
    if (!res.ok) throw new Error(`API 错误 ${res.status}`)
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('无返回内容')
    return extractJson(content)
  } catch (e) {
    console.warn('[DeepSeek] 识别失败', e)
    throw e
  }
}

/** 图片压缩到 800px 以内并转 base64 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const max = 800
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
      resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1])
    }
    img.onerror = reject
    img.src = url
  })
}
