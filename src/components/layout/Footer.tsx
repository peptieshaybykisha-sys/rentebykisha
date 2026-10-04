import { Link } from 'react-router-dom'
import logo from '@/assets/logo.png'
import { CATEGORIES } from '@/constants/catalog'

export default function Footer() {
  return (
    <footer className="mt-24 bg-burgundy text-blush-soft">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr_1fr] lg:px-12">
        <div>
          <span className="grid size-32 place-items-center rounded-2xl bg-blush-soft p-2">
            <img src={logo} alt="Renté by Kisha" width={160} height={160} loading="lazy" className="size-full object-contain" />
          </span>
          <p className="mt-4 max-w-xs text-[0.95rem] text-blush">Beautiful dresses for the moments you will remember. Rent it, wear it, return it.</p>
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
          <p>hello@rentebykisha.ph</p>
          <p>GCash · Delivery · Pickup</p>
        </FooterCol>
      </div>
      <div className="border-t border-blush-soft/15 px-5 py-5 pb-[calc(1.25rem+var(--bottom-nav-h))] text-center text-sm text-blush md:pb-5">
        © {new Date().getFullYear()} Renté by Kisha. All rights reserved.
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 font-serif text-2xl text-ivory">{title}</h2>
      <div className="flex flex-col gap-1.5 text-[0.95rem] text-blush [&_a]:w-fit [&_a]:py-0.5 [&_a:hover]:text-ivory">{children}</div>
    </div>
  )
}
