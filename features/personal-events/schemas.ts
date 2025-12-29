import { z } from 'zod'

export const createPersonalEventSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').max(200, 'Titel zu lang'),
  start_at: z.string().min(1, 'Startzeit ist erforderlich'),
  end_at: z.string().min(1, 'Endzeit ist erforderlich'),
  location_name: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  color: z.string().optional(),
})

export const updatePersonalEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  start_at: z.string().optional(),
  end_at: z.string().optional(),
  location_name: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  color: z.string().optional(),
})
