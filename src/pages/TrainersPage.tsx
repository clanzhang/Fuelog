import Page from '../components/Page'
import TrainerHeader from '../components/trainers/TrainerHeader'
import WeeklyBurnChart from '../components/trainers/WeeklyBurnChart'
import TrainerPlanList from '../components/trainers/TrainerPlanList'
import TrainerFormSheet from '../components/trainers/TrainerFormSheet'
import useTrainerPlans from '../hooks/useTrainerPlans'

export default function TrainersPage() {
  const {
    formOpen,
    setFormOpen,
    values,
    updateForm,
    plans,
    weekChart,
    totalBurned,
    submitPlan,
    togglePlan,
    removePlan,
  } = useTrainerPlans()

  return (
    <Page>
      <TrainerHeader totalBurned={totalBurned} onAdd={() => setFormOpen(true)} />

      <WeeklyBurnChart weekChart={weekChart} />

      <TrainerPlanList
        plans={plans}
        onToggle={togglePlan}
        onRemove={removePlan}
        onAdd={() => setFormOpen(true)}
      />

      <TrainerFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        values={values}
        onChange={updateForm}
        onSubmit={submitPlan}
      />
    </Page>
  )
}


