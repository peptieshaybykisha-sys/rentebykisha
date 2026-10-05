import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Heart, Search, ShoppingBag, ReceiptText, User } from 'lucide-react'
import { useAuthStore, useCartStore, useWishlistStore } from '@/stores'
import { cn } from '@/lib/utils'
import { useNavigation } from '@/hooks/useSettings'
import SearchDialog from './SearchDialog'

function Badge({ n }: { n: number }) {
  if (!n) return null
  return (
    <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-burgundy px-1 text-[0.7rem] font-semibold leading-5 text-ivory">
      {n}
      <span className="sr-only"> items</span>
    </span>
  )
}

function IconLink({ to, label, children }: { to: string; label: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      title={label}
      className={({ isActive }) =>
        cn('relative grid size-11 place-items-center rounded-full text-burgundy transition-colors hover:bg-blush-soft', isActive && 'bg-blush-soft')
      }
    >
      {children}
    </NavLink>
  )
}

export default function Header() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const cartCount = useCartStore((s) => s.items.length)
  const saved = useWishlistStore((s) => s.ids.length)
  const user = useAuthStore((s) => s.user)
  const { main } = useNavigation()
  const transparent = pathname === '/' && !scrolled

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 h-[var(--header-h)] transition-[background-color,box-shadow,backdrop-filter] duration-300',
          transparent ? 'bg-transparent' : 'bg-cream/90 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md',
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
          <Link to="/" className="flex items-baseline gap-2 text-burgundy" aria-label="Renté by Kisha, home">
            <span className="font-serif text-[1.9rem] font-medium italic leading-none md:text-4xl">Renté</span>
            <span className="text-xs font-medium uppercase tracking-[0.3em] md:text-[0.8rem]">by Kisha</span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
            {main.map((n, i) => (
              <NavLink
                key={`${n.to}-${i}`}
                to={n.to}
                end={n.to === '/'}
                className="link-underline py-1 text-[0.98rem] font-medium tracking-wide text-ink hover:text-burgundy aria-[current=page]:text-burgundy"
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search dresses"
              className="grid size-11 place-items-center rounded-full text-burgundy transition-colors hover:bg-blush-soft"
            >
              <Search className="size-[1.35rem]" strokeWidth={1.6} />
            </button>
            <span className="hidden items-center gap-0.5 md:flex">
              <IconLink to="/wishlist" label="Saved dresses">
                <Heart className="size-[1.35rem]" strokeWidth={1.6} />
                <Badge n={saved} />
              </IconLink>
              <IconLink to="/rentals" label="My rentals">
                <ReceiptText className="size-[1.35rem]" strokeWidth={1.6} />
              </IconLink>
              <IconLink to="/account" label={user ? 'My account' : 'Log in'}>
                <User className="size-[1.35rem]" strokeWidth={1.6} />
              </IconLink>
            </span>
            <IconLink to="/cart" label="Rental cart">
              <ShoppingBag className="size-[1.35rem]" strokeWidth={1.6} />
              <Badge n={cartCount} />
            </IconLink>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
