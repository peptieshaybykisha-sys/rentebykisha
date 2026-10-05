/**
 * Upload sanitisation. A file's name and declared MIME type are chosen by the sender, so neither is trusted:
 * the real type is read from the file's first bytes and checked against a short allow-list.
 */

export const MAX_VIDEO_BYTES = 20 * 1024 * 1024
export const MAX_VIDEO_SECONDS = 5

export type FileKind = 'jpeg' | 'png' | 'webp' | 'mp4' | 'webm'

const MIME: Record<FileKind, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  mp4: 'video/mp4',
  webm: 'video/webm',
}

const ascii = (b: Uint8Array, from: number, to: number) => String.fromCharCode(...b.subarray(from, to))

/** Identifies a file by its magic bytes; returns null for anything outside the allow-list (SVG, HTML, scripts, ...). */
export async function sniffFileType(file: Blob): Promise<FileKind | null> {
  const b = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg'
  if (b[0] === 0x89 && ascii(b, 1, 4) === 'PNG' && b[4] === 0x0d && b[5] === 0x0a) return 'png'
  if (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP') return 'webp'
  if (ascii(b, 4, 8) === 'ftyp' && !/^(qt {2}|heic|heix|mif1)/.test(ascii(b, 8, 12))) return 'mp4'
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return 'webm'
  return null
}

export const mimeFor = (kind: FileKind) => MIME[kind]

/** Throws a friendly error unless the file is a real JPG, PNG or WebP within the size limit. */
export async function assertImage(file: File, maxBytes: number): Promise<void> {
  if (file.size === 0) throw new Error('That file is empty.')
  if (file.size > maxBytes) throw new Error(`That image is too large. Please choose one under ${Math.round(maxBytes / 1048576)} MB.`)
  const kind = await sniffFileType(file)
  if (kind !== 'jpeg' && kind !== 'png' && kind !== 'webp') throw new Error('Please upload a JPG, PNG or WebP image.')
}

/** Throws unless the file is a real MP4/WebM, under the size limit and at most MAX_VIDEO_SECONDS long. Returns its kind. */
export async function assertVideo(file: File): Promise<'mp4' | 'webm'> {
  if (file.size === 0) throw new Error('That file is empty.')
  if (file.size > MAX_VIDEO_BYTES) throw new Error(`That video is too large. Please choose one under ${MAX_VIDEO_BYTES / 1048576} MB.`)
  const kind = await sniffFileType(file)
  if (kind !== 'mp4' && kind !== 'webm') throw new Error('Please upload an MP4 or WebM video.')

  const url = URL.createObjectURL(file)
  try {
    const duration = await new Promise<number>((resolve, reject) => {
      const v = document.createElement('video')
      v.preload = 'metadata'
      v.muted = true
      v.onloadedmetadata = () => resolve(v.duration)
      v.onerror = () => reject(new Error('That video could not be read. Please try another file.'))
      v.src = url
    })
    if (!Number.isFinite(duration) || duration <= 0) throw new Error('That video could not be read. Please try another file.')
    if (duration > MAX_VIDEO_SECONDS + 0.2) throw new Error(`Videos can be at most ${MAX_VIDEO_SECONDS} seconds. This one is ${duration.toFixed(1)} s.`)
  } finally {
    URL.revokeObjectURL(url)
  }
  return kind
}
