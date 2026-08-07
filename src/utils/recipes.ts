// AI 生成食谱工具（DashScope 通义千问）

export interface GeneratedRecipe {
  name: string
  calories: number
  cookTime: string
  difficulty: '简单' | '中等' | '较难'
  ingredients: string[]
  steps: string[]
  tips: string
}

const SYSTEM_PROMPT = `你是一个中餐厨师和营养师。用户会告诉你他们有的食材、厨具和口味偏好，你需要推荐 6 道可以做的菜。

要求：
1. 必须是真实存在的菜谱，不要编造
2. 每道菜标注预估卡路里（基于常规份量）
3. 标注烹饪时间
4. 标注难度：简单/中等/较难
5. 如果有多种食材，尽量组合使用
6. 考虑用户选择的厨具，推荐的菜必须能用该厨具做出来

严格以 JSON 格式返回，不要包含其他文字：
{
  "recipes": [
    {
      "name": "菜名",
      "calories": 数字,
      "cookTime": "XX分钟",
      "difficulty": "简单/中等/较难",
      "ingredients": ["食材1", "食材2"],
      "steps": ["步骤1", "步骤2", "步骤3"],
      "tips": "一句烹饪小提示"
    }
  ]
}`

export async function generateRecipes(
  ingredients: string[],
  tool: string,
  flavor: string,
): Promise<GeneratedRecipe[]> {
  const API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY as string | undefined
  if (!API_KEY) {
    await new Promise((r) => setTimeout(r, 800))
    throw new Error('未配置 DashScope API Key')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen-vl-max',
          input: {
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              {
                role: 'user',
                content: [
                  {
                    text: `我有的食材：${ingredients.join('、')}
厨具：${tool}
口味偏好：${flavor || '不限'}
请推荐 6 道可以做的菜。`,
                  },
                ],
              },
            ],
          },
        }),
        signal: controller.signal,
      },
    )

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      let msg = `API 错误 ${response.status}`
      try {
        const err = JSON.parse(errText)
        if (err?.message) msg = err.message
      } catch {
        /* ignore */
      }
      if (/authentication|invalid.*api.*key|401|403/i.test(msg)) {
        throw new Error('API Key 无效，请检查 .env 中的 VITE_DASHSCOPE_API_KEY')
      }
      throw new Error(msg)
    }

    const data = await response.json()
    const content = data?.output?.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty response')

    // content 可能是字符串或数组，统一取文本
    let text = ''
    if (typeof content === 'string') {
      text = content
    } else if (Array.isArray(content)) {
      text = content.map((c) => (typeof c === 'string' ? c : c?.text ?? '')).join('\n')
    }
    if (!text.trim()) throw new Error('Empty response')

    // 兼容 markdown 代码块
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid response format')

    const raw = JSON.parse(jsonMatch[0])
    const list = Array.isArray(raw.recipes) ? raw.recipes : []
    return list.slice(0, 6).map((r: Record<string, unknown>) => ({
      name: String(r.name ?? ''),
      calories: Number(r.calories) || 0,
      cookTime: String(r.cookTime ?? ''),
      difficulty: (['简单', '中等', '较难'].includes(String(r.difficulty))
        ? String(r.difficulty)
        : '简单') as GeneratedRecipe['difficulty'],
      ingredients: Array.isArray(r.ingredients) ? r.ingredients.map(String) : [],
      steps: Array.isArray(r.steps) ? r.steps.map(String) : [],
      tips: String(r.tips ?? ''),
    }))
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('生成超时，请重试')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
