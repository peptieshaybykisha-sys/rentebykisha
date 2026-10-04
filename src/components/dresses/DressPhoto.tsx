import type { Dress } from '@/types'
import DressArt from './DressArt'

interface Props {
  dress: Dress
  index?: number
  className?: string
  priority?: boolean
}

/** Renders a real photo when `src` exists, otherwise the vector shoot. */
export default function DressPhoto({ dress, index = 0, className, priority }: Props) {
  const img = dress.images[index] ?? dress.images[0]
  if (img.src)
    return <img src={img.src} alt={img.alt} loading={priority ? 'eager' : 'lazy'} decoding="async" className={className} />
  return <DressArt dress={dress} view={img.view} title={img.alt} className={className} />
}
