import { z } from 'zod';

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, 'Old password must be at least 6 characters.'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters.')

    .regex(/[a-z]/, 'Must include at least one lowercase letter.')
    .regex(/[0-9]/, 'Must include at least one number.'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
