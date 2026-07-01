import { z } from 'zod';

export const WorkerEarningsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().min(1).optional(),
  ),
  from: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid from date')
    .optional(),
  to: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid to date')
    .optional(),
});

export type WorkerEarningsQuery = z.infer<typeof WorkerEarningsQuerySchema>;
