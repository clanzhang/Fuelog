import Page from './Page'
import DiaryHeader from './diary/DiaryHeader'
import WeekDateStrip from './diary/WeekDateStrip'
import CalorieBanner from './diary/CalorieBanner'
import DiaryFoodGrid from './diary/DiaryFoodGrid'
import MealSummary from './diary/MealSummary'
import useDayDiary from '../hooks/useDayDiary'
import { useNavigate } from 'react-router-dom'

/**
 * 饮食日记页（组合组件）
 * 内部调用 useDayDiary Hook 管理日期与数据，
 * 组合 头部 / 日期条 / 总摄入 / 食物网格 / 餐类汇总。
 */
export default function DiaryScreen() {
  const navigate = useNavigate()
  const { selected, setSelected, week, dayFoods, consumed, remaining, calorieGoal, deleteFood } = useDayDiary()

  return (
    <Page>
      <DiaryHeader />

      <WeekDateStrip week={week} selected={selected} onSelect={setSelected} />

      <CalorieBanner consumed={consumed} calorieGoal={calorieGoal} remaining={remaining} />

      <DiaryFoodGrid
        foods={dayFoods}
        onOpen={(id) => navigate(`/food/${id}`)}
        onDelete={deleteFood}
      />

      <MealSummary foods={dayFoods} />
    </Page>
  )
}
