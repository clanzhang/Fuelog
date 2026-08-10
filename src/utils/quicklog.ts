// 一句话快速记录：LLM 解析 + 本地营养库计算
// 原则：AI 负责"理解用户说了什么"，本地代码负责"营养数值"
import { computeNutrition } from './nutrition'
import type { MealType } from '../types'

// AI 解析出的食物条目
interface ParsedItem {
  name: string
  emoji?: string
  original_text: string
  amount: number
  unit: string
}

interface ParsedResult {
  items: ParsedItem[]
  meal_type: MealType
}

// 计算后的食物条目（用于确认卡片）
export interface QuickFoodItem {
  name: string
  emoji: string
  amount: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  isEstimated: boolean // 本地库没有 → AI 估算
}

export interface QuickLogResult {
  items: QuickFoodItem[]
  mealType: MealType
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

// 常用量词 → 估算克数
const AMOUNT_HINTS: Record<string, number> = {
  碗: 200,
  杯: 250,
  个: 50,
  片: 30,
  份: 300,
  盘: 300,
  只: 100,
  瓶: 500,
  盒: 250,
  包: 100,
}

const SYSTEM_PROMPT = `你是一个食物识别引擎。用户会用中文描述他们吃了什么，你需要拆解成具体的食物条目。

规则：
1. 把混合描述拆成单独的食物条目
2. 估算每份食物的合理份量（克数）
3. 如果是常见菜品（如"黄焖鸡米饭"），拆成主要成分
4. 用户说的量词（一碗、一杯、一份）转为估算克数
5. 常见量词参考：
   - 一碗米饭 ≈ 200g
   - 一杯牛奶 ≈ 250ml
   - 一个鸡蛋 ≈ 50g
   - 一份外卖 ≈ 常规单人份
6. 不要编造不存在的食物
7. 每项给一个合适的 emoji

严格以 JSON 格式返回，不要包含其他文字：
{
  "items": [
    {
      "name": "食物名称",
      "emoji": "食物emoji",
      "original_text": "用户原文中对应的部分",
      "amount": 数字,
      "unit": "g/ml/个/片/碗/杯/份"
    }
  ],
  "meal_type": "breakfast/lunch/dinner/snack"
}`

// 解析用户的一句话
export async function parseFoodInput(text: string): Promise<ParsedResult> {
  const API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY as string | undefined
  // 未配置 API Key 时降级：本地启发式解析（用关键词匹配）
  if (!API_KEY) {
    return localParse(text)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

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
          model: 'qwen-max',
          input: {
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: [{ text }] },
            ],
          },
        }),
        signal: controller.signal,
      },
    )

    if (!response.ok) {
      throw new Error(`API 错误 ${response.status}`)
    }

    const data = await response.json()
    const content = data?.output?.choices?.[0]?.message?.content
    let textContent = ''
    if (typeof content === 'string') textContent = content
    else if (Array.isArray(content)) {
      textContent = content.map((c) => (typeof c === 'string' ? c : c?.text ?? '')).join('\n')
    }
    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid response format')
    const raw = JSON.parse(jsonMatch[0])
    return {
      items: Array.isArray(raw.items) ? raw.items : [],
      meal_type: (raw.meal_type as MealType) ?? guessMealType(),
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('解析超时，请重试')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

// 本地启发式解析（无 API Key / API 失败时的兜底）
function localParse(text: string): ParsedResult {
  // 简单按常见食物关键词切分
  const commonFoods = [
    { name: '鸡蛋', emoji: '🥚', amount: 50, unit: '个' },
    { name: '米饭', emoji: '🍚', amount: 200, unit: '碗' },
    { name: '面条', emoji: '🍜', amount: 200, unit: '碗' },
    { name: '牛奶', emoji: '🥛', amount: 250, unit: '杯' },
    { name: '面包', emoji: '🍞', amount: 60, unit: '片' },
    { name: '苹果', emoji: '🍎', amount: 150, unit: '个' },
    { name: '香蕉', emoji: '🍌', amount: 120, unit: '根' },
    { name: '鸡胸肉', emoji: '🍗', amount: 150, unit: '份' },
    { name: '豆腐', emoji: '🧊', amount: 200, unit: '份' },
    { name: '酸奶', emoji: '🥛', amount: 200, unit: '杯' },
  ]
  const items: ParsedItem[] = []
  commonFoods.forEach((f) => {
    if (text.includes(f.name)) {
      items.push({
        name: f.name,
        original_text: f.name,
        amount: f.amount,
        unit: f.unit,
      })
    }
  })
  // 没有匹配到任何食物
  if (items.length === 0) {
    items.push({ name: text.slice(0, 10), original_text: text, amount: 200, unit: '份' })
  }
  return { items, meal_type: guessMealType() }
}

// 根据当前时间推断餐类
function guessMealType(): MealType {
  const h = new Date().getHours()
  if (h >= 6 && h < 11) return 'breakfast'
  if (h >= 11 && h < 15) return 'lunch'
  if (h >= 15 && h < 18) return 'snack'
  if (h >= 18 && h < 23) return 'dinner'
  return 'breakfast'
}

// 完整流程：解析 → 本地营养计算 → 汇总
export async function quickLog(text: string): Promise<QuickLogResult> {
  const parsed = await parseFoodInput(text)
  const items: QuickFoodItem[] = parsed.items.map((item) => {
    const amount = item.amount || AMOUNT_HINTS[item.unit] || 100
    const nutrition = computeNutrition(item.name, amount)
    return {
      name: item.name,
      emoji: item.emoji || '🍽️',
      amount,
      unit: item.unit || 'g',
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      isEstimated: nutrition.isEstimated,
    }
  })

  return {
    items,
    mealType: parsed.meal_type,
    totalCalories: items.reduce((s, i) => s + i.calories, 0),
    totalProtein: Math.round(items.reduce((s, i) => s + i.protein, 0) * 10) / 10,
    totalCarbs: Math.round(items.reduce((s, i) => s + i.carbs, 0) * 10) / 10,
    totalFat: Math.round(items.reduce((s, i) => s + i.fat, 0) * 10) / 10,
  }
}
