import { NavLink } from 'react-router-dom'
import { BookOpen, Heart, House, User } from 'lucide-react'
import { useWishlistStore } from '@/stores'
import { cn } from '@/lib/utils'

const ITEMS = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/collections', label: 'Lookbook', icon: BookOpen },
  { to: '/wishlist', label: 'Saved', icon: Heart },
  { to: '/account', label: 'Account', icon: User },
]

export default function BottomNav() {
  const saved = useWishlistStore((s) => s.ids.length)
  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid h-[var(--bottom-nav-h)] max-w-md grid-cols-4">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn('flex h-full flex-col items-center justify-center gap-0.5 text-[0.8rem] font-medium transition-colors', isActive ? 'text-burgundy' : 'text-muted')
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon className="size-6" strokeWidth={isActive ? 2 : 1.5} aria-hidden />
                    {label === 'Saved' && saved > 0 && (
                      <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-burgundy px-1 text-[0.65rem] leading-4 text-ivory">{saved}</span>
                    )}
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
