/** Admin-only writes to Firebase. Imported lazily from the admin area. */
import { deleteDoc, doc, collection, setDoc } from 'firebase/firestore'
import { deleteObject, getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { app, db } from './firebase'
import { imageToBlob } from './image'
import type { Dress, DressImage } from '@/types'

const needDb = () => {
  if (!db) throw new Error('Firebase is not configured. Add your keys to .env and restart.')
  return db
}

export const newDressId = () => doc(collection(needDb(), 'dresses')).id

export async function saveDress(id: string, data: Omit<Dress, 'id' | 'createdAt'> & { createdAt?: number }) {
  // Firestore rejects undefined, so strip it.
  const clean = JSON.parse(JSON.stringify(data)) as Record<string, unknown>
  clean.createdAt = data.createdAt || Date.now()
  await setDoc(doc(needDb(), 'dresses', id), clean)
}

export async function uploadDressImage(dressId: string, file: File): Promise<DressImage> {
  if (!app) throw new Error('Firebase is not configured.')
  const blob = await imageToBlob(file)
  const safe = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').slice(0, 40) || 'photo'
  const path = `dresses/${dressId}/${Date.now()}-${safe}.jpg`
  const r = ref(getStorage(app), path)
  await uploadBytes(r, blob, { contentType: 'image/jpeg' })
  return { url: await getDownloadURL(r), path, alt: '' }
}

export async function deleteImages(paths: string[]) {
  if (!app) return
  const storage = getStorage(app)
  await Promise.allSettled(paths.map((p) => deleteObject(ref(storage, p))))
}

export async function deleteDress(dress: Dress) {
  await deleteImages(dress.images.map((i) => i.path))
  await deleteDoc(doc(needDb(), 'dresses', dress.id))
}

export async function saveSetting(key: 'sizeGuide' | 'howItWorks' | 'hero', data: object) {
  await setDoc(doc(needDb(), 'settings', key), data)
}
