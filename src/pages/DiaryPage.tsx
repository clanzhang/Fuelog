import Page from '../components/Page'
import DiaryHeader from '../components/diary/DiaryHeader'
import WeekDateStrip from '../components/diary/WeekDateStrip'
import CalorieBanner from '../components/diary/CalorieBanner'
import DiaryFoodGrid from '../components/diary/DiaryFoodGrid'
import MealSummary from '../components/diary/MealSummary'
import useDayDiary from '../hooks/useDayDiary'
import { useNavigate } from 'react-router-dom'

export default function DiaryPage() {
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

