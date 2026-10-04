const MAX_BYTES = 8 * 1024 * 1024

/** Validates and shrinks a receipt photo so it fits comfortably in local storage. */
export async function receiptToDataUrl(file: File, maxDim = 900, quality = 0.72): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please upload an image (JPG or PNG).')
  if (file.size > MAX_BYTES) throw new Error('That image is too large. Please choose one under 8 MB.')

  const src = await new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(new Error('We could not read that file. Please try another image.'))
    r.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = () => reject(new Error('That file does not look like a valid image.'))
    i.src = src
  })

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return src
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}
