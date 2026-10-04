import { z } from 'zod'

/** Philippine mobile numbers: 09XX XXX XXXX or +63 9XX XXX XXXX. */
export const phoneSchema = z
  .string()
  .min(1, 'Please enter your phone number.')
  .refine((v) => /^(\+?63|0)9\d{9}$/.test(v.replace(/[\s-]/g, '')), 'Use a Philippine mobile number, like 0917 123 4567.')

export const customerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.'),
  email: z.string().min(1, 'Please enter your email.').email('That email does not look right.'),
  phone: phoneSchema,
})
