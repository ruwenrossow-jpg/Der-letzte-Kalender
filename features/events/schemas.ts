import { z } from 'zod'

export const createEventSchema = z.object({
  entity_id: z.string().uuid('Invalid entity ID'),
  title: z.string().min(1, 'Titel ist erforderlich').max(200, 'Titel zu lang'),
  description: z.string().optional(),
  cover_image_url: z.string().url('Ungültige URL').optional().or(z.literal('')),
  // Accept datetime-local format (YYYY-MM-DDTHH:MM) from HTML input
  start_at: z.string().min(1, 'Startdatum ist erforderlich'),
  end_at: z.string().min(1, 'Enddatum ist erforderlich'),
  location_name: z.string().max(200, 'Ort zu lang').optional(),
  visibility: z.enum(['public', 'followers']),
})

export type CreateEventFormData = z.infer<typeof createEventSchema>
