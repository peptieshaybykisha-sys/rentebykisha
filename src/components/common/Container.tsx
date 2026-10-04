import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps {
  as?: ElementType
  className?: string
  children: ReactNode
  id?: string
  'aria-labelledby'?: string
}

export default function Container({ as: Tag = 'div', className, children, ...rest }: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12', className)} {...rest}>
      {children}
    </Tag>
  )
}

export function PageTitle({ title, script, children }: { title: string; script?: string; children?: ReactNode }) {
  return (
    <header className="pb-8 pt-10 text-center sm:pt-14">
      {script && <p className="font-script-title text-3xl text-burgundy-soft sm:text-4xl">{script}</p>}
      <h1 className="text-5xl sm:text-6xl">{title}</h1>
      {children && <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{children}</p>}
    </header>
  )
}
