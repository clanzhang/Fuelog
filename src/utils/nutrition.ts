// 本地食物营养数据库（每 100g）
// 用于"一句话快速记录"：AI 解析出食物后，用本地库计算精确营养
// 数据库没有的食物 → 用 AI 估算值并标注"AI 估算"

export interface NutritionPer100g {
  calories: number
  protein: number
  carbs: number
  fat: number
}

const FOOD_DATABASE: Record<string, NutritionPer100g> = {
  米饭: { calories: 116, protein: 2.6, carbs: 25.6, fat: 0.3 },
  白米饭: { calories: 116, protein: 2.6, carbs: 25.6, fat: 0.3 },
  鸡胸肉: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  鸡蛋: { calories: 144, protein: 13.3, carbs: 1.5, fat: 9.5 },
  牛奶: { calories: 54, protein: 3.0, carbs: 3.4, fat: 3.2 },
  豆浆: { calories: 31, protein: 2.9, carbs: 1.2, fat: 1.6 },
  牛肉面: { calories: 95, protein: 5.5, carbs: 12, fat: 2.5 },
  黄焖鸡: { calories: 150, protein: 12, carbs: 5, fat: 9 },
  全麦面包: { calories: 247, protein: 13, carbs: 41, fat: 3.4 },
  面包: { calories: 312, protein: 9, carbs: 49, fat: 5 },
  猪肉: { calories: 143, protein: 18, carbs: 0, fat: 7.5 },
  五花肉: { calories: 349, protein: 14, carbs: 0, fat: 32 },
  牛肉: { calories: 125, protein: 19, carbs: 0, fat: 5 },
  鸡腿: { calories: 181, protein: 16, carbs: 0, fat: 12 },
  豆腐: { calories: 73, protein: 8, carbs: 2.8, fat: 3.5 },
  西兰花: { calories: 34, protein: 2.8, carbs: 4.3, fat: 0.4 },
  番茄: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  土豆: { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  苹果: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  香蕉: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  酸奶: { calories: 72, protein: 3.5, carbs: 5, fat: 3.3 },
  面条: { calories: 138, protein: 4.5, carbs: 25, fat: 1.1 },
  粥: { calories: 46, protein: 1.1, carbs: 9.5, fat: 0.2 },
  燕麦: { calories: 389, protein: 17, carbs: 66, fat: 7 },
  红薯: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  玉米: { calories: 112, protein: 4, carbs: 22, fat: 1.2 },
  鸡肉: { calories: 167, protein: 19.3, carbs: 0, fat: 9.4 },
  鸡翅: { calories: 194, protein: 17.4, carbs: 0, fat: 13.6 },
  鸭肉: { calories: 240, protein: 15.5, carbs: 0.2, fat: 19.7 },
  虾: { calories: 93, protein: 18.6, carbs: 2.8, fat: 0.8 },
  鱼: { calories: 113, protein: 20.5, carbs: 0, fat: 3.5 },
  鲈鱼: { calories: 105, protein: 18.6, carbs: 0, fat: 3.4 },
  三文鱼: { calories: 139, protein: 17.2, carbs: 0, fat: 7.8 },
  白菜: { calories: 17, protein: 1.5, carbs: 3.2, fat: 0.1 },
  菠菜: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  黄瓜: { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1 },
  胡萝卜: { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2 },
  茄子: { calories: 25, protein: 1, carbs: 5.9, fat: 0.2 },
  青椒: { calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2 },
  蘑菇: { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  洋葱: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  西瓜: { calories: 30, protein: 0.6, carbs: 8, fat: 0.2 },
  葡萄: { calories: 69, protein: 0.7, carbs: 18, fat: 0.2 },
  橙子: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  草莓: { calories: 32, protein: 0.7, carbs: 8, fat: 0.3 },
  核桃: { calories: 654, protein: 15, carbs: 14, fat: 65 },
  花生: { calories: 567, protein: 26, carbs: 16, fat: 49 },
  豆浆粉: { calories: 400, protein: 20, carbs: 60, fat: 8 },
}

// 查询食物营养（支持别名匹配，如"白米饭"→"米饭"）
export function lookupNutrition(name: string): NutritionPer100g | null {
  if (FOOD_DATABASE[name]) return FOOD_DATABASE[name]
  // 精确匹配失败：尝试子串匹配（如"牛肉面"里含"牛肉"）
  for (const key of Object.keys(FOOD_DATABASE)) {
    if (name.includes(key) || key.includes(name)) return FOOD_DATABASE[key]
  }
  return null
}

// 按份量计算营养（amount 单位 g/ml）
export function computeNutrition(name: string, amount: number): {
  calories: number
  protein: number
  carbs: number
  fat: number
  isEstimated: boolean
} {
  const per100g = lookupNutrition(name)
  const factor = amount / 100
  if (per100g) {
    return {
      calories: Math.round(per100g.calories * factor),
      protein: Math.round(per100g.protein * factor * 10) / 10,
      carbs: Math.round(per100g.carbs * factor * 10) / 10,
      fat: Math.round(per100g.fat * factor * 10) / 10,
      isEstimated: false,
    }
  }
  // 数据库没有 → 用通用估算（每 100g 约 150 kcal / 蛋白 8g / 碳水 18g / 脂肪 5g）
  return {
    calories: Math.round(150 * factor),
    protein: Math.round(8 * factor * 10) / 10,
    carbs: Math.round(18 * factor * 10) / 10,
    fat: Math.round(5 * factor * 10) / 10,
    isEstimated: true,
  }
}
