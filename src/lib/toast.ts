import { toast } from 'sonner'

/** Success toast with an optional link-style action. */
export function notify(message: string, to?: { label: string; href: string }) {
  toast.success(message, to ? { action: { label: to.label, onClick: () => window.location.assign(to.href) } } : undefined)
}
