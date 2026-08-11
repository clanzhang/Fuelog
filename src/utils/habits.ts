// 习惯追踪配置（饮水 / 运动）
// 供 Today 页等使用，集中管理常量

// 饮品标签
export const WATER_LABEL: Record<string, string> = { water: '水', tea: '茶', coffee: '咖啡' }
// 饮品图标（对应 SolarIcon name）
export const WATER_ICON: Record<string, string> = { water: 'water', tea: 'tea', coffee: 'coffee' }

// 饮水快捷选项（ml）
export const WATER_QUICK = [
  { key: '250', label: '+250ml', hint: '一杯', icon: 'water' },
  { key: '500', label: '+500ml', hint: '一瓶', icon: 'water' },
  { key: '750', label: '+750ml', hint: '一大杯', icon: 'water' },
]

// 运动快捷时长（分钟）
export const EXERCISE_QUICK = [10, 20, 30, 45, 60]
