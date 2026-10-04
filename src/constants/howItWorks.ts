import { CalendarCheck, Camera, Heart, MessageCircle, PackageCheck, Search, Shirt, Sparkles, Truck, WalletCards, type LucideIcon } from 'lucide-react'
import type { HowItWorksContent, StepIconName } from '@/types'

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

export const STEP_ICON_NAMES = Object.keys(STEP_ICONS) as StepIconName[]

export const MAX_STEPS = 5

/** Shown until an admin saves their own content in Supabase. */
export const DEFAULT_HOW_IT_WORKS: HowItWorksContent = {
  steps: [
    { icon: 'search', title: 'Choose a Dress', text: 'Browse the collection and pick your size.' },
    { icon: 'calendar', title: 'Check Availability', text: 'Select your dates and see instantly if it is free.' },
    { icon: 'wallet', title: 'Reserve & Pay', text: 'Pay by GCash and upload your receipt.' },
    { icon: 'sparkles', title: 'Wear Your Moment', text: 'Pick up or receive your steamed, ready dress.' },
    { icon: 'package', title: 'Return', text: 'Send it back. We handle the cleaning.' },
  ],
  faq: [
    {
      q: 'What is the security deposit?',
      a: 'A refundable amount held while the dress is with you. After you return the dress and it passes our inspection, the deposit is refunded to your GCash. If there is damage beyond normal wear, we will tell you before deducting anything.',
    },
    { q: 'How long can I keep the dress?', a: 'Each rental price includes 3 days. You can extend up to 7 days in total; extra days are about 20% of the rental price each.' },
    { q: 'How far ahead should I book?', a: 'Please book at least 2 days before your pick-up date so we can steam, pack and prepare your dress.' },
    { q: 'Pickup or delivery?', a: 'Pick up from our studio for free, or have it delivered for ₱150 within Metro Manila.' },
    { q: 'Who cleans the dress?', a: 'We do. Please do not wash or iron it. Just return it as it is, and we will take care of the rest.' },
    { q: 'How do I pay?', a: 'For now we accept GCash. Send the total to our GCash number and upload your receipt at checkout. Our team verifies it manually and confirms your rental.' },
  ],
}
