import { Icon } from '@iconify/react'
import homeSmile from '@iconify/icons-solar/home-smile-bold'
import notebookBookmark from '@iconify/icons-solar/notebook-bookmark-bold'
import bookBookmark from '@iconify/icons-solar/book-bookmark-bold'
import dumbbell from '@iconify/icons-solar/dumbbell-bold'
import userCircle from '@iconify/icons-solar/user-circle-bold'
import calendar from '@iconify/icons-solar/calendar-bold'
import waterdrop from '@iconify/icons-solar/waterdrop-bold'
import fire from '@iconify/icons-solar/fire-bold'
import running from '@iconify/icons-solar/running-bold'
import magnifer from '@iconify/icons-solar/magnifer-bold'
import heart from '@iconify/icons-solar/heart-bold'
import filters from '@iconify/icons-solar/filters-bold'
import camera from '@iconify/icons-solar/camera-bold'
import gallery from '@iconify/icons-solar/gallery-bold'
import penNewSquare from '@iconify/icons-solar/pen-new-square-bold'
import closeCircle from '@iconify/icons-solar/close-circle-bold'
import checkCircle from '@iconify/icons-solar/check-circle-bold'
import arrowLeft from '@iconify/icons-solar/arrow-left-bold'
import arrowRight from '@iconify/icons-solar/arrow-right-bold'
import menuDots from '@iconify/icons-solar/menu-dots-bold'
import chart2 from '@iconify/icons-solar/chart-2-bold'
import clockCircle from '@iconify/icons-solar/clock-circle-bold'
import teaCup from '@iconify/icons-solar/tea-cup-bold'
import cupHot from '@iconify/icons-solar/cup-hot-bold'
import basketball from '@iconify/icons-solar/basketball-bold'
import star from '@iconify/icons-solar/star-bold'
import settings from '@iconify/icons-solar/settings-bold'
import trashBin from '@iconify/icons-solar/trash-bin-minimalistic-bold'
import document from '@iconify/icons-solar/document-bold'
import mapPoint from '@iconify/icons-solar/map-point-bold'
import medalRibbon from '@iconify/icons-solar/medal-ribbon-bold'
import cupFirst from '@iconify/icons-solar/cup-first-bold'
import stopwatch from '@iconify/icons-solar/stopwatch-bold'
import bolt from '@iconify/icons-solar/bolt-bold'
import walking from '@iconify/icons-solar/walking-bold'
import user from '@iconify/icons-solar/user-bold'
import usersGroup from '@iconify/icons-solar/users-group-two-rounded-bold'
import gift from '@iconify/icons-solar/gift-bold'
import leaf from '@iconify/icons-solar/leaf-bold'
import plate from '@iconify/icons-solar/plate-bold'
import chefHat from '@iconify/icons-solar/chef-hat-bold'
import donut from '@iconify/icons-solar/donut-bold'
import cup from '@iconify/icons-solar/cup-bold'
import shop from '@iconify/icons-solar/shop-bold'
import heartPulse from '@iconify/icons-solar/heart-pulse-bold'
import batteryCharge from '@iconify/icons-solar/battery-charge-bold'
import target from '@iconify/icons-solar/target-bold'
import pulse2 from '@iconify/icons-solar/pulse-2-bold'
import addCircle from '@iconify/icons-solar/add-circle-bold'
import bellBing from '@iconify/icons-solar/bell-bing-bold'
import galleryRound from '@iconify/icons-solar/gallery-round-bold'
import stopwatchPlay from '@iconify/icons-solar/stopwatch-play-bold'
import thermometer from '@iconify/icons-solar/thermometer-bold'
import flame from '@iconify/icons-solar/flame-bold'
import diagramUp from '@iconify/icons-solar/diagram-up-bold'
import repeat from '@iconify/icons-solar/repeat-bold'
import cloud from '@iconify/icons-solar/cloud-bold'
import logout from '@iconify/icons-solar/logout-2-bold'
import login from '@iconify/icons-solar/login-2-bold'

const icons = {
  'home': homeSmile,
  'notebook': notebookBookmark,
  'book': bookBookmark,
  'dumbbell': dumbbell,
  'user-circle': userCircle,
  'calendar': calendar,
  'water': waterdrop,
  'fire': fire,
  'running': running,
  'search': magnifer,
  'heart': heart,
  'filters': filters,
  'camera': camera,
  'gallery': gallery,
  'edit': penNewSquare,
  'close': closeCircle,
  'check': checkCircle,
  'arrow-left': arrowLeft,
  'arrow-right': arrowRight,
  'dots': menuDots,
  'chart': chart2,
  'clock': clockCircle,
  'tea': teaCup,
  'coffee': cupHot,
  'basketball': basketball,
  'star': star,
  'settings': settings,
  'trash': trashBin,
  'document': document,
  'map': mapPoint,
  'medal': medalRibbon,
  'cup-first': cupFirst,
  'stopwatch': stopwatch,
  'bolt': bolt,
  'walking': walking,
  'user': user,
  'users': usersGroup,
  'gift': gift,
  'leaf': leaf,
  'plate': plate,
  'chef': chefHat,
  'donut': donut,
  'cup': cup,
  'shop': shop,
  'heart-pulse': heartPulse,
  'battery': batteryCharge,
  'target': target,
  'pulse': pulse2,
  'add': addCircle,
  'bell': bellBing,
  'gallery-round': galleryRound,
  'stopwatch-play': stopwatchPlay,
  'thermometer': thermometer,
  'flame': flame,
  'trend-up': diagramUp,
  'ball': basketball,
  'repeat': repeat,
  'cloud': cloud,
  'logout': logout,
  'login': login,
}

export type SolarIconName = keyof typeof icons

export default function SolarIcon({
  name,
  className,
  size = 24,
}: {
  name: SolarIconName
  className?: string
  size?: number
}) {
  return (
    <Icon
      icon={icons[name]}
      width={size}
      height={size}
      className={className}
    />
  )
}
