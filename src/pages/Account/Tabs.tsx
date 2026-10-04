import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarHeart, Heart, MapPin, ReceiptText } from 'lucide-react'
import { EmptyState, Notice } from '@/components/common/States'
import DressGrid from '@/components/dresses/DressGrid'
import { RentalCard } from '@/components/rentals/RentalParts'
import { Button } from '@/components/ui/Button'
import { ListSkeleton } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Field'
import { useDressList } from '@/hooks/useDresses'
import { cancelFitting, removeAddress, saveAddress, updateProfile } from '@/lib/api'
import { phoneSchema } from '@/lib/validation'
import { formatLong } from '@/lib/utils'
import { useAuthStore, useWishlistStore } from '@/stores'
import { useAccount } from '@/stores/account'

const Loading = () => <ListSkeleton rows={3} label="Loading…" />

/* ---------- Profile ---------- */
const profileSchema = z.object({ name: z.string().trim().min(2, 'Please enter your name.'), phone: phoneSchema })
type ProfileValues = z.infer<typeof profileSchema>

export function ProfileTab() {
  const user = useAuthStore((s) => s.user)!
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: user.name, phone: user.phone } })

  return (
    <form
      noValidate
      className="max-w-lg space-y-5"
      onSubmit={handleSubmit(async (v) => {
        setSaved(false)
        setError('')
        try {
          await updateProfile(user.id, v)
          setSaved(true)
        } catch (e) {
          setError(e instanceof Error ? e.message : 'We could not save your changes.')
        }
      })}
    >
      {saved && <Notice tone="success">Your profile has been updated.</Notice>}
      {error && <Notice>{error}</Notice>}
      <Input label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
      <Input label="Email" type="email" value={user.email} readOnly hint="Your email is used to log in." />
      <Input label="Phone" type="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
      <Button type="submit" loading={isSubmitting}>
        Save changes
      </Button>
    </form>
  )
}

/* ---------- Rentals ---------- */
export function RentalsTab() {
  const { rentals, loaded } = useAccount()
  if (!loaded) return <Loading />
  if (!rentals.length) return <EmptyState icon={ReceiptText} title="No rentals yet." to="/dresses" cta="Find a dress for your next occasion" className="py-10" />
  return (
    <ul className="space-y-4">
      {rentals.map((r) => (
        <li key={r.id}>
          <RentalCard rental={r} />
        </li>
      ))}
    </ul>
  )
}

/* ---------- Wishlist ---------- */
export function WishlistTab() {
  const dresses = useDressList()
  const ids = useWishlistStore((s) => s.ids)
  const saved = dresses.filter((d) => ids.includes(d.id))
  if (!saved.length) return <EmptyState icon={Heart} title="Your saved dresses are waiting for you." to="/dresses" cta="Explore the collection" className="py-10" />
  return <DressGrid dresses={saved} />
}

/* ---------- Fittings ---------- */
export function FittingsTab() {
  const dresses = useDressList()
  const { fittings, loaded } = useAccount()
  const [error, setError] = useState('')
  if (!loaded) return <Loading />
  if (!fittings.length) return <EmptyState icon={CalendarHeart} title="No fittings booked." to="/fitting" cta="Schedule my fitting" className="py-10" />
  return (
    <>
      {error && <Notice className="mb-4">{error}</Notice>}
      <ul className="space-y-3">
        {fittings.map((f) => (
          <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-ivory p-4 sm:p-5">
            <div>
              <p className="font-serif text-2xl text-burgundy">
                {formatLong(f.date)} · {f.time}
              </p>
              <p className="text-[0.95rem] text-muted">{dresses.find((d) => d.id === f.dressId)?.name ?? 'Open fitting — a few dresses'}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancelFitting(f.id).catch((e) => setError(e instanceof Error ? e.message : 'We could not cancel that fitting.'))}
            >
              Cancel
            </Button>
          </li>
        ))}
      </ul>
    </>
  )
}

/* ---------- Addresses ---------- */
const addrSchema = z.object({
  label: z.string().trim().min(1, 'Give this address a name, like Home.'),
  line1: z.string().trim().min(8, 'Please enter a complete address.'),
  city: z.string().trim().min(2, 'Please enter your city.'),
})
type AddrValues = z.infer<typeof addrSchema>

export function AddressesTab() {
  const { addresses, loaded } = useAccount()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddrValues>({ resolver: zodResolver(addrSchema) })

  if (!loaded) return <Loading />
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        {addresses.length ? (
          <ul className="space-y-3">
            {addresses.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-ivory p-4">
                <div className="flex gap-3">
                  <MapPin className="mt-1 size-5 shrink-0 text-burgundy-soft" aria-hidden />
                  <div>
                    <p className="font-medium">{a.label}</p>
                    <p className="text-[0.95rem] text-muted">
                      {a.line1}, {a.city}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAddress(a.id).catch((e) => setError(e instanceof Error ? e.message : 'We could not remove that address.'))}
                  aria-label={`Remove ${a.label}`}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={MapPin} title="No saved addresses." className="py-6">
            Add one now and delivery will be a little faster next time.
          </EmptyState>
        )}
      </div>

      <form
        noValidate
        className="space-y-4 rounded-[1.75rem] border border-line bg-ivory p-5 sm:p-6"
        onSubmit={handleSubmit(async (v) => {
          setError('')
          try {
            await saveAddress(v)
            reset()
          } catch (e) {
            setError(e instanceof Error ? e.message : 'We could not save that address.')
          }
        })}
      >
        <h3 className="text-2xl">Add an address</h3>
        {error && <Notice>{error}</Notice>}
        <Input label="Label" placeholder="Home" error={errors.label?.message} {...register('label')} />
        <Input label="Address" autoComplete="street-address" placeholder="House no., street, barangay" error={errors.line1?.message} {...register('line1')} />
        <Input label="City" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
        <Button type="submit" loading={isSubmitting}>
          Save address
        </Button>
      </form>
    </div>
  )
}
