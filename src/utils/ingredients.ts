// 食材选菜功能：预设选项

export interface IngredientOption {
  emoji: string
  name: string
}

// 食材分组（多选）
export interface IngredientGroup {
  title: string
  emoji: string
  note?: string
  items: IngredientOption[]
}

export const INGREDIENT_GROUPS: IngredientGroup[] = [
  {
    title: '蔬菜',
    emoji: '🥬',
    items: [
      { emoji: '🥔', name: '土豆' },
      { emoji: '🥕', name: '胡萝卜' },
      { emoji: '🥦', name: '花菜' },
      { emoji: '🥒', name: '西葫芦' },
      { emoji: '🍅', name: '番茄' },
      { emoji: '🌿', name: '芹菜' },
      { emoji: '🥒', name: '黄瓜' },
      { emoji: '🧅', name: '洋葱' },
      { emoji: '🍄', name: '菌菇' },
      { emoji: '🍆', name: '茄子' },
      { emoji: '🧊', name: '豆腐' },
      { emoji: '🥬', name: '包菜' },
      { emoji: '🥬', name: '白菜' },
      { emoji: '🫑', name: '青椒' },
      { emoji: '🥬', name: '菠菜' },
    ],
  },
  {
    title: '蛋白质',
    emoji: '🥩',
    items: [
      { emoji: '🍗', name: '鸡肉' },
      { emoji: '🐷', name: '猪肉' },
      { emoji: '🐮', name: '牛肉' },
      { emoji: '🥚', name: '鸡蛋' },
      { emoji: '🍤', name: '虾' },
      { emoji: '🐟', name: '鱼' },
      { emoji: '🥓', name: '腊肠' },
      { emoji: '🌭', name: '香肠' },
      { emoji: '🧈', name: '午餐肉' },
    ],
  },
  {
    title: '主食',
    emoji: '🍚',
    note: '可不选',
    items: [
      { emoji: '🍜', name: '面条' },
      { emoji: '🍞', name: '面包' },
      { emoji: '🍚', name: '米饭' },
      { emoji: '🥟', name: '饺子皮' },
      { emoji: '🫓', name: '饼' },
    ],
  },
]

// 厨具（单选）
export const TOOL_OPTIONS: IngredientOption[] = [
  { emoji: '🍳', name: '炒锅' },
  { emoji: '🍲', name: '汤锅' },
  { emoji: '📺', name: '烤箱' },
  { emoji: '💨', name: '空气炸锅' },
  { emoji: '⚡', name: '微波炉' },
  { emoji: '🍚', name: '电饭煲' },
]

// 口味（单选，可不选）
export const FLAVOR_OPTIONS: IngredientOption[] = [
  { emoji: '🌶️', name: '辣' },
  { emoji: '🧄', name: '蒜香' },
  { emoji: '🍯', name: '甜酸' },
  { emoji: '🧂', name: '清淡' },
  { emoji: '🫘', name: '酱香' },
  { emoji: '🍋', name: '酸辣' },
]
