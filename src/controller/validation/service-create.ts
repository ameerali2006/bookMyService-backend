import { z } from 'zod';

export const serviceRegistrationSchema = z
  .object({
    category: z.string().min(2),
    description: z.string().min(5),
    price: z.number().positive(),
    priceUnit: z.enum(['per hour', 'per job', 'per item']),
    duration: z.number().positive(),
    image: z.string().url(),
    status: z.enum(['active', 'inactive']).default('active'),
  });
