import { z } from 'zod';

export const UserRegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  phone: z.string(),
  googleId: z.string().optional(),
  role: z.enum(['user', 'worker']),
});

export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;

export const WorkerRegisterSchema = UserRegisterSchema.extend({
  category: z.string().min(1, 'Category is required'),
  experience: z.enum(['0-1', '2-5', '6-10', '10+']),
  documents: z.string().url('Document must be a valid URL'),
  latitude: z.string(),
  longitude: z.string(),
  zone: z.string().min(1, 'Zone is required'),
  isVerified: z.boolean().optional(),
});

export type WorkerRegisterInput = z.infer<typeof WorkerRegisterSchema>;

export const schemasByRole = {
  user: UserRegisterSchema,
  worker: WorkerRegisterSchema,
} as const;
