import { Suspense, useEffect } from 'react'
import { Navigate, useLocation, useOutlet } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'
import Toaster from './Toaster'
import { PageLoader } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/stores'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

export default function Layout() {
  const { pathname } = useLocation()
  const reduce = useReducedMotion()
  const isHome = pathname === '/'
  const outlet = useOutlet()
  const isAdmin = useAuthStore((s) => s.isAdmin)

  // Admins work in the dashboard only: no shop pages, cart or customer features.
  if (isAdmin) return <Navigate to="/admin" replace />

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-burgundy px-5 py-3 text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <Header />
        <motion.main
          key={pathname}
          id="main"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={isHome ? 'flex-1' : 'flex-1 pt-[var(--header-h)]'}
        >
          <Suspense fallback={<PageLoader />}>
            {outlet}
          </Suspense>
        </motion.main>
      <Footer />
      <BottomNav />
      <Toaster />
    </div>
  )
}
