import { MESSAGES } from '../../config/constants/message';
import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .min(3, { message: MESSAGES.NAME_MUST_BE_AT_LEAST_3_CHARACTERS_LONG })
    .max(20, { message: MESSAGES.NAME_MUST_BE_LESS_THAN_20_CHARACTERS })
    .regex(/^[A-Za-z\s]+$/, { message: MESSAGES.NAME_CAN_ONLY_CONTAIN_ALPHABETS_AND_SPAC }),

  email:
     z.string().email().optional(),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, { message: MESSAGES.PHONE_NUMBER_MUST_BE_EXACTLY_10_DIGITS })
    .optional(),

  image: z.string().optional(),
});
