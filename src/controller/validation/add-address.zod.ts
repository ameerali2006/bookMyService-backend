import { MESSAGES } from '../../config/constants/message';
import { z } from 'zod';

export const addressSchema = z.object({
  label: z.enum(['Home', 'Work', 'Shop']).refine((val) => !!val, {
    message: MESSAGES.PLEASE_SELECT_AN_ADDRESS_LABEL,
  }),

  buildingName: z
    .string()
    .trim()
    .min(1, { message: MESSAGES.BUILDING_NAME_OR_FLAT_NUMBER_IS_REQUIRED }),

  street: z
    .string()
    .trim()
    .min(1, { message: MESSAGES.STREET_IS_REQUIRED }),

  area: z
    .string()
    .trim()
    .min(1, { message: MESSAGES.AREA_IS_REQUIRED }),

  city: z
    .string()
    .trim()
    .min(1, { message: MESSAGES.CITY_IS_REQUIRED }),

  state: z
    .string()
    .trim()
    .min(1, { message: MESSAGES.STATE_IS_REQUIRED }),

  country: z
    .string()
    .trim()
    .min(1, { message: MESSAGES.COUNTRY_IS_REQUIRED }),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, { message: MESSAGES.ENTER_A_VALID_10DIGIT_PHONE_NUMBER }),

  pinCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: MESSAGES.ENTER_A_VALID_6DIGIT_PIN_CODE }),

  landmark: z
    .string()
    .trim()
    .optional()
    .default(''),

  latitude: z
    .number()
    .optional()
    .refine((val) => val === undefined || (val >= -90 && val <= 90), {
      message: MESSAGES.INVALID_LATITUDE_VALUE,
    }),

  longitude: z
    .number()
    .optional()
    .refine((val) => val === undefined || (val >= -180 && val <= 180), {
      message: MESSAGES.INVALID_LONGITUDE_VALUE,
    }),
});

export type AddressForm = z.infer<typeof addressSchema>
