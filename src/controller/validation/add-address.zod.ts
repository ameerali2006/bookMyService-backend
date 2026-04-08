import { z } from 'zod';

export const addressSchema = z.object({
  label: z.enum(['Home', 'Work', 'Shop']).refine((val) => !!val, {
    message: 'Please select an address label',
  }),

  buildingName: z
    .string()
    .trim()
    .min(1, { message: 'Building name or flat number is required' }),

  street: z
    .string()
    .trim()
    .min(1, { message: 'Street is required' }),

  area: z
    .string()
    .trim()
    .min(1, { message: 'Area is required' }),

  city: z
    .string()
    .trim()
    .min(1, { message: 'City is required' }),

  state: z
    .string()
    .trim()
    .min(1, { message: 'State is required' }),

  country: z
    .string()
    .trim()
    .min(1, { message: 'Country is required' }),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit phone number' }),

  pinCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: 'Enter a valid 6-digit PIN code' }),

  landmark: z
    .string()
    .trim()
    .optional()
    .default(''),

  latitude: z
    .number()
    .optional()
    .refine((val) => val === undefined || (val >= -90 && val <= 90), {
      message: 'Invalid latitude value',
    }),

  longitude: z
    .number()
    .optional()
    .refine((val) => val === undefined || (val >= -180 && val <= 180), {
      message: 'Invalid longitude value',
    }),
});

export type AddressForm = z.infer<typeof addressSchema>
