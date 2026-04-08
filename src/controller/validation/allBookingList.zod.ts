import { z } from 'zod';

export const bookingStatusEnum = z.enum([
  'pending',
  'confirmed',
  'in-progress',
  'awaiting-final-payment',
  'completed',
  'cancelled',
]);
export const workerResponseEnum = z.enum([
  'accepted',
  'rejected',
  'pending',
]);
export const WorkerBookingListRequestDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),

  search: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().min(1).optional(),
  ),

  statuses: z.preprocess(
    (val) => {
      if (val === '' || val == null) return undefined;

      if (typeof val === 'string') return [val];

      if (Array.isArray(val)) {
        const cleaned = val.filter((v) => v !== '');
        return cleaned.length ? cleaned : undefined;
      }

      return undefined;
    },
    z.array(bookingStatusEnum).optional(),
  ),
  workerResponses: z.preprocess(
    (val) => {
      if (val === '' || val == null) return undefined;
      if (typeof val === 'string') return [val];
      if (Array.isArray(val)) {
        const cleaned = val.filter((v) => v !== '');
        return cleaned.length ? cleaned : undefined;
      }
      return undefined;
    },
    z.array(workerResponseEnum).optional(),
  ),

  from: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      'Invalid from date',
    )
    .optional(),

  to: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      'Invalid to date',
    )
    .optional(),
});

export type WorkerBookingListRequest =
  z.infer<typeof WorkerBookingListRequestDto>;
