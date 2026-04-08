import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters long' })
    .max(20, { message: 'Name must be less than 20 characters' })
    .regex(/^[A-Za-z\s]+$/, { message: 'Name can only contain alphabets and spaces' }),

  email:
     z.string().email().optional(),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, { message: 'Phone number must be exactly 10 digits' })
    .optional(),

  image: z.string().optional(),
});
