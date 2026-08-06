export interface FoodAnalysisResult {
  name: string
  emoji?: string
  calories: number
  carbs: number
  protein: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  confidence: 'high' | 'medium' | 'low'
  tips: string
}

export const EMPTY_RESULT: FoodAnalysisResult = {
  name: '',
  emoji: '🍽️',
  calories: 0,
  carbs: 0,
  protein: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  confidence: 'low',
  tips: '',
}

const SYSTEM_PROMPT = `你是一个专业的食物营养分析师。用户会发送一张食物照片。

分析规则：
1. 仔细观察照片中的食物，识别所有可见的食物成分
2. 如果有多种食物（如一份套餐），分别识别再汇总
3. 根据食物的种类和可见的份量大小来估算
4. 常见食物参考热量（用于交叉验证）：
   - 一碗米饭(200g) ≈ 230 kcal
   - 一块鸡胸肉(150g) ≈ 165 kcal
   - 一个鸡蛋 ≈ 70 kcal
   - 一杯牛奶(250ml) ≈ 150 kcal
5. 注意区分烹饪方式：煎炸 > 炒 > 蒸 > 煮
6. 注意计入可见的油脂、酱料
7. 白色肉类（鸡胸肉、鱼肉）不要和豆腐混淆

严格以 JSON 格式返回，不要包含其他文字：
{
  "name": "食物名称",
  "emoji": "合适的食物 emoji",
  "calories": 数字,
  "carbs": 数字,
  "protein": 数字,
  "fat": 数字,
  "fiber": 数字,
  "sugar": 数字,
  "sodium": 数字,
  "confidence": "high/medium/low",
  "tips": "一句话说明估算依据"
}`

export async function analyzeFood(imageBase64: string): Promise<FoodAnalysisResult> {
  const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined
  if (!API_KEY) {
    await new Promise((r) => setTimeout(r, 1200))
    throw new Error('未配置 API Key')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  try {
    // Moonshot Kimi 视觉模型（支持图像输入）
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k-vision-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      // 提取服务端错误信息
      let msg = `API 错误 ${response.status}`
      try {
        const err = JSON.parse(errText)
        if (err?.error?.message) msg = err.error.message
      } catch {
        /* ignore */
      }
      // 常见错误 → 中文提示
      if (/Authentication Fails|invalid api key|api key.*invalid|invalid key/i.test(msg)) {
        throw new Error('API Key 无效，请检查 .env 中的 VITE_DEEPSEEK_API_KEY')
      }
      throw new Error(msg)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty response')

    // 兼容 AI 返回 markdown 代码块的情况
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid response format')

    const raw = JSON.parse(jsonMatch[0])
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
      confidence: ['high', 'medium', 'low'].includes(raw.confidence)
        ? (raw.confidence as FoodAnalysisResult['confidence'])
        : 'low',
      tips: String(raw.tips ?? ''),
    }
  } finally {
    clearTimeout(timeout)
  }
}
