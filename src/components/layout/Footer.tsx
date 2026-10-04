import { Link } from 'react-router-dom'
import logo from '@/assets/logo.png'
import { CATEGORIES } from '@/constants/catalog'

export default function Footer() {
  return (
    <footer className="mt-24 bg-burgundy text-blush-soft">
      <div className="h-px bg-linear-to-r from-transparent via-gold/60 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10 lg:px-12">
        <div>
          <span className="grid size-20 place-items-center rounded-xl bg-blush-soft p-1.5">
            <img src={logo} alt="Renté by Kisha" width={80} height={80} loading="lazy" className="size-full object-contain" />
          </span>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-blush">
            Beautiful dresses for the moments you will remember. Rent it, wear it, return it.
          </p>
        </div>
        <FooterCol title="Collections">
          {CATEGORIES.map((c) => (
            <Link key={c} to={`/dresses?category=${c}`}>{c}</Link>
          ))}
        </FooterCol>
        <FooterCol title="Rent with us">
          <Link to="/how-it-works">How it works</Link>
          <Link to="/fitting">Schedule a fitting</Link>
          <Link to="/rentals">My rentals</Link>
          <Link to="/cart">Rental cart</Link>
        </FooterCol>
        <FooterCol title="Visit & contact">
          <p>By appointment only</p>
          <p>Tue – Sat, 10am – 6pm</p>
          <a href="mailto:hello@rentebykisha.ph">hello@rentebykisha.ph</a>
          <p>GCash · Delivery · Pickup</p>
        </FooterCol>
      </div>
      <div className="border-t border-blush-soft/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 pb-[calc(1.5rem+var(--bottom-nav-h))] text-xs text-blush/80 sm:px-8 md:flex-row md:pb-6 lg:px-12">
          <span>© {new Date().getFullYear()} Renté by Kisha. All rights reserved.</span>
          <span className="tracking-wide">Designer dress rentals · Philippines</span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      {/* ! is needed: the global h2 colour rule is unlayered and would otherwise beat the utility */}
      <h2 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold!">{title}</h2>
      <div className="flex flex-col gap-2.5 text-sm text-blush [&_a]:w-fit [&_a]:transition-colors [&_a:hover]:text-ivory">{children}</div>
    </div>
  )
}
