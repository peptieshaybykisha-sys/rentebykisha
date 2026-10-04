import { Toaster as Sonner } from 'sonner'

/** App-wide toast outlet. Fire toasts with `toast` from 'sonner'. */
export default function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      closeButton
      offset={16}
      mobileOffset={{ bottom: 'calc(var(--bottom-nav-h) + 0.75rem)', left: 16, right: 16 }}
      toastOptions={{
        classNames: {
          toast: '!rounded-2xl !bg-burgundy !text-ivory !border-0 !shadow-lift !font-sans',
          description: '!text-ivory/80',
          actionButton: '!rounded-full !bg-blush-soft !text-burgundy',
          closeButton: '!bg-burgundy !text-ivory !border-gold/40',
          icon: '!text-gold',
        },
      }}
    />
  )
}
