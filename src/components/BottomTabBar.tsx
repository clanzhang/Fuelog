import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SolarIcon, { type SolarIconName } from './SolarIcon'

const tabs: { path: string; label: string; icon: SolarIconName; activeIcon: SolarIconName }[] = [
  { path: '/today', label: 'Today', icon: 'home', activeIcon: 'home' },
  { path: '/diary', label: 'Diary', icon: 'notebook', activeIcon: 'notebook' },
  { path: '/recipes', label: 'Recipes', icon: 'book', activeIcon: 'book' },
  { path: '/trainers', label: 'Trainers', icon: 'dumbbell', activeIcon: 'dumbbell' },
  { path: '/profile', label: 'Profile', icon: 'user-circle', activeIcon: 'user-circle' },
]

export default function BottomTabBar({
  onFab,
  inputOpen,
}: {
  onFab: () => void
  inputOpen?: boolean
}) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-5 pb-5">
      <div className="pointer-events-auto relative flex w-full max-w-[430px] items-center justify-between rounded-[2rem] bg-white/80 px-4 pb-2 pt-2 shadow-[0_-4px_30px_rgba(30,30,46,0.08)] backdrop-blur-xl">
        {tabs.slice(0, 2).map((t) => (
          <TabButton key={t.path} {...t} active={location.pathname === t.path} onClick={() => navigate(t.path)} />
        ))}

        {/* FAB：点击展开/收起输入面板，旋转 45° 变"×" */}
        <motion.button
          onClick={onFab}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: inputOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="relative -top-7 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white shadow-fab"
          aria-label="添加食物"
        >
          <SolarIcon name="add" size={28} />
        </motion.button>

        {tabs.slice(2).map((t) => (
          <TabButton key={t.path} {...t} active={location.pathname === t.path} onClick={() => navigate(t.path)} />
        ))}
      </div>
    </div>
  )
}

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: SolarIconName
  active: boolean
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="flex flex-1 flex-col items-center gap-0.5 py-1">
      <SolarIcon
        name={icon}
        size={22}
        className={active ? 'text-primary' : 'text-[#B4B4C6]'}
      />
      <span
        className={`text-[10px] font-semibold ${active ? 'text-primary' : 'text-[#B4B4C6]'}`}
      >
        {label}
      </span>
    </button>
  )
}
