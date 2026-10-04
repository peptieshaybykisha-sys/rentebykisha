import type { ReactNode } from 'react'
import logo from '@/assets/logo.jpg'

/** Shared frame for login / register: the brand silk on one side, the form on the other. */
export default function AuthShell({ title, script, children }: { title: string; script?: string; children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-0 px-4 py-8 sm:px-8 md:grid-cols-[0.9fr_1.1fr] md:py-14 lg:px-12">
      <div className="relative hidden overflow-hidden rounded-l-[2.5rem] md:block">
        <img src={logo} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy/50 to-transparent" />
      </div>
      <div className="rounded-[2rem] border border-line bg-ivory p-6 sm:p-10 md:rounded-l-none md:rounded-r-[2.5rem] md:border-l-0">
        {script && <p className="font-script-title text-3xl text-burgundy-soft">{script}</p>}
        <h1 className="text-5xl">{title}</h1>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}
