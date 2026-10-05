import { useState, type CSSProperties } from 'react'
import { Shirt } from 'lucide-react'
import type { Dress } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  dress: Pick<Dress, 'images' | 'name'>
  index?: number
  className?: string
  priority?: boolean
  style?: CSSProperties
}

/** The dress photo uploaded by the admin, or a quiet placeholder when none exists yet. */
export default function DressPhoto({ dress, index = 0, className, priority, style }: Props) {
  const img = dress.images[index] ?? dress.images[0]
  const [loaded, setLoaded] = useState(false)
  if (!img)
    return (
      <div role="img" aria-label={`${dress.name} (photo coming soon)`} className={cn('grid place-items-center bg-gradient-to-b from-blush-soft to-cream text-blush', className)}>
        <Shirt className="size-1/4 max-w-12" strokeWidth={1} aria-hidden />
      </div>
    )
  return (
    <img
      src={img.url}
      style={style}
      alt={img.alt || dress.name}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
      className={cn('transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', className)}
    />
  )
}
