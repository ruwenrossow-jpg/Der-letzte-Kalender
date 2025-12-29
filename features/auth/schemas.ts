import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
})

export type LoginInput = z.infer<typeof loginSchema>
