import { useSearchParams, useNavigate } from 'react-router-dom'
import { CalendarHeart, Heart, MapPin, ReceiptText, UserRound, type LucideIcon } from 'lucide-react'
import Container from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores'
import { AddressesTab, FittingsTab, ProfileTab, RentalsTab, WishlistTab } from './Tabs'

const TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'rentals', label: 'My Rentals', icon: ReceiptText },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'fittings', label: 'Fitting Appointments', icon: CalendarHeart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
]

export default function Account() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)!
  const setUser = useAuthStore((s) => s.setUser)
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab')! : 'profile'
  const current = TABS.find((t) => t.id === tab)!

  return (
    <Container className="pb-8">
      <header className="pb-8 pt-10 sm:pt-14">
        <p className="font-script-title text-3xl text-burgundy-soft">Hello,</p>
        <h1 className="text-5xl sm:text-6xl">{user.name.split(' ')[0]}</h1>
      </header>

      <div className="grid gap-8 md:grid-cols-[15rem_1fr] lg:gap-14">
        <nav aria-label="Account sections" className="-mx-5 overflow-x-auto px-5 no-scrollbar md:mx-0 md:px-0">
          <ul className="flex gap-2 md:flex-col md:gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  aria-current={id === tab ? 'page' : undefined}
                  onClick={() => setParams({ tab: id }, { replace: true })}
                  className={cn(
                    'flex min-h-12 w-full items-center gap-3 whitespace-nowrap rounded-full px-5 text-left transition-colors md:rounded-2xl',
                    id === tab ? 'bg-burgundy text-ivory' : 'text-ink hover:bg-blush-soft',
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                  {label}
                </button>
              </li>
            ))}
            <li className="shrink-0 md:mt-4">
              <Button
                variant="ghost"
                className="w-full justify-start md:rounded-2xl"
                onClick={() => {
                  setUser(null)
                  navigate('/')
                }}
              >
                Log out
              </Button>
            </li>
          </ul>
        </nav>

        <section aria-labelledby="tab-title" className="min-w-0">
          <h2 id="tab-title" className="mb-6 text-4xl">
            {current.label}
          </h2>
          {tab === 'profile' && <ProfileTab />}
          {tab === 'rentals' && <RentalsTab />}
          {tab === 'wishlist' && <WishlistTab />}
          {tab === 'fittings' && <FittingsTab />}
          {tab === 'addresses' && <AddressesTab />}
        </section>
      </div>
    </Container>
  )
}
