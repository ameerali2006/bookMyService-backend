import { z } from 'zod';

export const ApprovalSchema = z.object({
  bookingId: z.string().min(1),
  serviceName: z.string().min(1),
  durationHours: z.number().min(1),
  distance: z.number().min(1),
  additionalItems: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.number().min(0),
      }),
    )
    .optional(),
  additionalNotes: z.string().optional(),
});

export type ApprovalData = z.infer<typeof ApprovalSchema>;
