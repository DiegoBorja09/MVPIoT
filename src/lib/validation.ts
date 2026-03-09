import { z } from 'zod';

export const webhookValueSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  value: z.string(),
  persist: z.boolean(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().optional(),
});

export const webhookPayloadSchema = z.object({
  event_id: z.string().uuid(),
  webhook_id: z.string(),
  device_id: z.string().uuid(),
  thing_id: z.string().uuid(),
  values: z.array(webhookValueSchema).min(1),
});
