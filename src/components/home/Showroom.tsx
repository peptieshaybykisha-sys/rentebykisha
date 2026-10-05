import { memo } from 'react'
import { useShowroom, type ShowroomView } from '@/hooks/useSettings'

/** The photo itself, positioned by the admin's focus point, zoom and brightness. Also used for the admin preview. */
export function ShowroomImage({ src, focusX, focusY, zoom, brightness }: ShowroomView) {
  const origin = `${focusX}% ${focusY}%`
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      decoding="async"
      className="absolute inset-0 size-full object-cover"
      style={{ objectPosition: origin, transformOrigin: origin, transform: zoom === 1 ? undefined : `scale(${zoom})`, filter: brightness === 1 ? undefined : `brightness(${brightness})` }}
    />
  )
}

/** The boutique interior revealed behind the doors. The photo is chosen in /admin > Showroom photo. */
function Showroom() {
  const view = useShowroom()
  return (
    <div className="absolute inset-0 isolate overflow-hidden bg-blush-soft">
      <ShowroomImage {...view} />
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(90,16,37,0.14))]" />
    </div>
  )
}

export default memo(Showroom)
