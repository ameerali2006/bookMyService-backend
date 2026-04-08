import { z } from 'zod';

export const WorkerRegisterSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(1, 'Phone is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    category: z.string().min(1, 'Category is required'),
    experience: z.enum(['0-1', '2-5', '6-10', '10+']),
    documents: z.string().url('Document must be a valid URL'),
    latitude: z.string(),
    longitude: z.string(),
    zone: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
