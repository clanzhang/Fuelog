// 日期格式化工具

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** 将 "YYYY-MM-DD" 格式化为 "Aug 11 · Tue" */
export function formatSubtitle(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDate()
  const weekday = WEEKDAYS[d.getDay()]
  const month = d.toLocaleString('en-US', { month: 'short' })
  return `${month} ${day} · ${weekday}`
}
