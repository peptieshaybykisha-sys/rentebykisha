import { useEffect, useState } from 'react'
import { receiptUrl } from '@/lib/api'

/** Fetches a short-lived signed link for a private receipt image. */
export function useReceiptUrl(path?: string, loader: (p: string) => Promise<string | null> = receiptUrl) {
  const [state, setState] = useState<{ path?: string; url: string | null }>({ url: null })
  useEffect(() => {
    if (!path) return
    let cancelled = false
    void loader(path).then((url) => !cancelled && setState({ path, url }))
    return () => {
      cancelled = true
    }
  }, [path, loader])
  return state.path === path ? state.url : null
}
