import { ErrorState } from '@/components/common/States'

export default function NotFound() {
  return (
    <ErrorState title="This page has left the boutique" to="/" cta="Back to the doors">
      We could not find what you were looking for.
    </ErrorState>
  )
}
