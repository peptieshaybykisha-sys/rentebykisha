import { CalendarCheck, Camera, Heart, MessageCircle, PackageCheck, Search, Shirt, Sparkles, Truck, WalletCards, type LucideIcon } from 'lucide-react'
import type { StepIconName } from '@/types'

// eslint-disable-next-line react-refresh/only-export-components
export const STEP_ICONS: Record<StepIconName, LucideIcon> = {
  search: Search,
  calendar: CalendarCheck,
  wallet: WalletCards,
  sparkles: Sparkles,
  package: PackageCheck,
  truck: Truck,
  heart: Heart,
  shirt: Shirt,
  camera: Camera,
  message: MessageCircle,
}

// eslint-disable-next-line react-refresh/only-export-components
export const STEP_ICON_NAMES = Object.keys(STEP_ICONS) as StepIconName[]
