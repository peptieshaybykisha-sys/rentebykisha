import clsx, { type ClassValue } from 'clsx'
import { format, parseISO } from 'date-fns'

export const cn = (...v: ClassValue[]) => clsx(v)

export const formatPeso = (n: number) => `₱${n.toLocaleString('en-PH')}`

export const toISODate = (d: Date) => format(d, 'yyyy-MM-dd')
export const fromISODate = (s: string) => parseISO(s)

export const formatShort = (s: string) => format(parseISO(s), 'MMM d')
export const formatLong = (s: string) => format(parseISO(s), 'EEE, MMM d, yyyy')

export function formatRange(start: string, end: string) {
  return start === end ? formatShort(start) : `${formatShort(start)} → ${formatShort(end)}`
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const t = amt < 0 ? 0 : 255
  const p = Math.abs(amt)
  const c = (v: number) => Math.round((t - v) * p + v)
  const r = c((n >> 16) & 255)
  const g = c((n >> 8) & 255)
  const b = c(n & 255)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}
